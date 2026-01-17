import { useState, useEffect } from "react";
import Close from "@mui/icons-material/Close";
import Person from "@mui/icons-material/Person";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import CommentsService, { Comment } from "../services/CommentsService";
import AuthService from "../services/AuthService";
import "./styles/CommentsModal.css";

interface CommentsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly dishId: number;
  readonly dishName: string;
  readonly comments: Comment[];
  readonly onCommentAdded: (comment: Comment) => void;
}

export default function CommentsModal({
  isOpen,
  onClose,
  dishId,
  dishName,
  comments,
  onCommentAdded,
}: CommentsModalProps) {
  const { t } = useTranslation();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const MAX_COMMENT_LENGTH = 500;

  useEffect(() => {
    if (!isOpen) {
      setNewComment("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim() || isSubmitting) return;

    if (newComment.trim().length > MAX_COMMENT_LENGTH) {
      toast.error(
        `Comment is too long. Maximum ${MAX_COMMENT_LENGTH} characters allowed.`,
        {
          position: "top-center",
          autoClose: 3000,
        }
      );
      return;
    }

    const user = AuthService.getCurrentUser();
    if (!user) {
      toast.error(t("comments_modal_login_required"), {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await CommentsService.addComment(dishId, newComment.trim());

      const newCommentObj: Comment = {
        content: newComment.trim(),
        authorId: user.id,
        dishId: dishId,
      };

      onCommentAdded(newCommentObj);
      setNewComment("");

      toast.success(t("comments_modal_success"), {
        position: "top-center",
        autoClose: 2000,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("comments_modal_error");

      toast.error("✗ " + errorMessage, {
        position: "top-center",
        autoClose: 2000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`comments-modal-overlay ${isOpen ? "open" : ""}`}
      onPointerDown={onClose}
    >
      <div
        className="comments-modal-content"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          className="comments-close-button"
          onClick={onClose}
          title={t("comments_modal_close")}
        >
          <Close className="comments-close-icon" />
        </button>

        <h2 className="comments-modal-title">
          {t("comments_modal_title")}: {dishName}
        </h2>

        <form onSubmit={handleSubmit} className="comments-modal-form">
          <div className="comments-modal-input-wrapper">
            <textarea
              className="comments-modal-input"
              placeholder={t("comments_modal_placeholder")}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              maxLength={MAX_COMMENT_LENGTH}
            />
            <div className="comments-modal-counter">
              {newComment.length}/{MAX_COMMENT_LENGTH}
            </div>
          </div>
          <button
            type="submit"
            className="comments-modal-submit"
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting
              ? t("comments_modal_submitting")
              : t("comments_modal_add_button")}
          </button>
        </form>

        <div className="comments-modal-list">
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div
                key={`${comment.dishId}-${comment.authorId}-${index}`}
                className="comments-modal-item"
              >
                <div className="comments-modal-header">
                  <Person className="comments-modal-user-icon" />
                  <span className="comments-modal-author">User</span>
                </div>
                <div className="comments-modal-text">{comment.content}</div>
              </div>
            ))
          ) : (
            <div className="comments-modal-empty">
              <p>{t("comments_modal_no_comments")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
