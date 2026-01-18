import { useState, useEffect } from "react";
import Close from "@mui/icons-material/Close";
import Person from "@mui/icons-material/Person";
import MoreVert from "@mui/icons-material/MoreVert";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Swal from "sweetalert2";
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
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const MAX_COMMENT_LENGTH = 500;

  useEffect(() => {
    if (!isOpen) {
      setNewComment("");
      setOpenMenuIndex(null);
    }
  }, [isOpen]);

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim() || isSubmitting) return;

    if (newComment.trim().length > MAX_COMMENT_LENGTH) {
      toast.error(
        t("comments_modal_too_long").replace(
          "{0}",
          MAX_COMMENT_LENGTH.toString(),
        ),
        {
          position: "top-center",
          autoClose: 3000,
        },
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

  const handleDeleteComment = async (index: number) => {
    const result = await Swal.fire({
      title: t("comments_modal_delete_title"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#2a2a2a",
      confirmButtonText: t("comments_modal_delete_confirm"),
      cancelButtonText: t("comments_modal_delete_cancel"),
      background: "linear-gradient(180deg, #949494 0%, #383838 100%)",
      color: "#1a1a1a",
    });

    if (result.isConfirmed) {
      try {
        await CommentsService.deleteComment(index);

        const updatedComments = localComments.filter((_, i) => i !== index);
        setLocalComments(updatedComments);

        toast.success(t("comments_modal_delete_success"), {
          position: "top-center",
          autoClose: 2000,
        });
      } catch (err) {
        console.error("Error deleting comment:", err);
        toast.error(t("comments_modal_delete_error"), {
          position: "top-center",
          autoClose: 2000,
        });
      }
    }
  };

  const handleEditComment = async (index: number, currentContent: string) => {
    const result = await Swal.fire({
      title: t("comments_modal_edit_title"),
      input: "textarea",
      inputValue: currentContent,
      inputAttributes: {
        maxlength: MAX_COMMENT_LENGTH.toString(),
        style: "min-height: 150px; resize: vertical;",
      },
      width: "600px",
      showCancelButton: true,
      confirmButtonColor: "#1976d2",
      cancelButtonColor: "#757575",
      confirmButtonText: t("comments_modal_edit_confirm"),
      cancelButtonText: t("comments_modal_edit_cancel"),
      background: "linear-gradient(180deg, #949494 0%, #383838 100%)",
      color: "#1a1a1a",
      customClass: {
        input: "swal2-textarea-custom",
        popup: "swal2-popup-custom",
      },
      didOpen: () => {
        const textarea = Swal.getInput() as unknown as HTMLTextAreaElement;
        if (textarea) {
          if (textarea.parentElement) {
            textarea.parentElement.style.position = "relative";
          }

          const counter = document.createElement("div");
          counter.className = "swal2-character-counter";
          counter.style.cssText =
            "position: absolute; bottom: 0.75rem; right: 1rem; color: rgba(0, 0, 0, 0.6); font-size: 14px; pointer-events: none;";
          counter.textContent = `${textarea.value.length}/${MAX_COMMENT_LENGTH}`;

          textarea.parentElement?.appendChild(counter);

          textarea.addEventListener("input", () => {
            counter.textContent = `${textarea.value.length}/${MAX_COMMENT_LENGTH}`;
          });
        }
      },
      inputValidator: (value) => {
        if (!value?.trim()) {
          return t("comments_modal_edit_empty");
        }
        if (value.trim().length > MAX_COMMENT_LENGTH) {
          return t("comments_modal_edit_too_long").replace(
            "{0}",
            MAX_COMMENT_LENGTH.toString(),
          );
        }
        return null;
      },
    });

    if (result.isConfirmed && result.value) {
      try {
        await CommentsService.editComment(index, result.value.trim());

        const updatedComments = [...localComments];
        updatedComments[index] = {
          ...updatedComments[index],
          content: result.value.trim(),
        };
        setLocalComments(updatedComments);

        toast.success(t("comments_modal_edit_success"), {
          position: "top-center",
          autoClose: 2000,
        });
      } catch (err) {
        console.error("Error editing comment:", err);
        toast.error(t("comments_modal_edit_error"), {
          position: "top-center",
          autoClose: 2000,
        });
      }
    }
  };

  const currentUser = AuthService.getCurrentUser();

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
          {localComments.length > 0 ? (
            localComments.map((comment, index) => (
              <div
                key={`${comment.dishId}-${comment.authorId}-${index}`}
                className="comments-modal-item"
              >
                <div className="comments-modal-header">
                  <Person className="comments-modal-user-icon" />
                  <span className="comments-modal-author">
                    {comment.userName || t("comments_modal_user")}
                  </span>
                  {currentUser &&
                    Number(currentUser.id) === Number(comment.authorId) && (
                      <div className="comments-modal-menu-container">
                        <button
                          className="comments-modal-menu-button"
                          onClick={() =>
                            setOpenMenuIndex(
                              openMenuIndex === index ? null : index,
                            )
                          }
                        >
                          <MoreVert className="comments-modal-menu-icon" />
                        </button>
                        {openMenuIndex === index && (
                          <div className="comments-modal-menu-dropdown">
                            <button
                              className="comments-modal-menu-item"
                              onClick={() => {
                                handleEditComment(index, comment.content);
                                setOpenMenuIndex(null);
                              }}
                            >
                              {t("comments_modal_menu_edit")}
                            </button>
                            <button
                              className="comments-modal-menu-item"
                              onClick={() => {
                                handleDeleteComment(index);
                                setOpenMenuIndex(null);
                              }}
                            >
                              {t("comments_modal_menu_delete")}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
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
