import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Close from "@mui/icons-material/Close";
import Person from "@mui/icons-material/Person";
import MoreVert from "@mui/icons-material/MoreVert";
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

const MAX_COMMENT_LENGTH = 500;

type CommentFormData = {
  content: string;
};

export default function CommentsModal({
  isOpen,
  onClose,
  dishId,
  dishName,
  comments,
  onCommentAdded,
}: CommentsModalProps) {
  const { t } = useTranslation();
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<{ id: number; content: string } | null>(null);

  const commentSchema = useMemo(() => z.object({
    content: z.string().trim().min(1, { message: t("comments_modal_validation_required") }),
  }), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
    },
  });

  const commentContent = watch("content");

  useEffect(() => {
    if (!isOpen) {
      reset();
      setOpenMenuIndex(null);
    }
  }, [isOpen, reset]);

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const onSubmit = async (data: CommentFormData) => {
    const user = AuthService.getCurrentUser();
    if (!user) {
      toast.error(t("comments_modal_login_required"));
      return;
    }

    const isDuplicate = localComments.some(
      (comment) =>
        comment.content.trim().toLowerCase() ===
          data.content.trim().toLowerCase() &&
        Number(comment.authorId) === Number(user.id),
    );

    if (isDuplicate) {
      toast.error(t("comments_modal_duplicate_error"));
      return;
    }

    try {
      const addedComment = await CommentsService.addComment(dishId, data.content.trim());

      setLocalComments((prev) => [...prev, addedComment]);
      onCommentAdded(addedComment);
      reset();

      toast.success(t("comments_modal_success"));
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error(t("comments_modal_error"));
    }
  };

  const confirmDelete = async () => {
    if (!deleteCommentId) return;
    try {
      await CommentsService.deleteComment(deleteCommentId);
      setLocalComments((prev) => prev.filter((c) => c.commentId !== deleteCommentId));
      toast.success(t("comments_modal_delete_success"));
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast.error(t("comments_modal_delete_error"));
    } finally {
      setDeleteCommentId(null);
    }
  };

  const confirmEdit = async () => {
    if (!editingComment) return;
    
    const content = editingComment.content.trim();
    if (!content) {
         toast.error(t("comments_modal_edit_empty"));
         return;
    }
    
    if (content.length > MAX_COMMENT_LENGTH) {
         toast.error(t("comments_modal_edit_too_long").replace("{0}", MAX_COMMENT_LENGTH.toString()));
         return;
    }

    try {
      await CommentsService.editComment(editingComment.id, content);
      setLocalComments(prev => prev.map(c => 
          c.commentId === editingComment.id ? { ...c, content } : c
      ));
      toast.success(t("comments_modal_edit_success"));
      setEditingComment(null);
    } catch (err) {
       console.error("Error editing comment:", err);
       toast.error(t("comments_modal_edit_error"));
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

        <form onSubmit={handleSubmit(onSubmit)} className="comments-modal-form">
          <div className="comments-modal-input-wrapper">
            <textarea
              className="comments-modal-input"
              placeholder={t("comments_modal_placeholder")}
              rows={4}
              maxLength={MAX_COMMENT_LENGTH}
              {...register("content")}
            />
            <div className="comments-modal-counter">
              {commentContent.length}/{MAX_COMMENT_LENGTH}
            </div>
            {errors.content && (
              <span className="error-text">{errors.content.message}</span>
            )}
          </div>
          <button
            type="submit"
            className="comments-modal-submit"
            disabled={isSubmitting}
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
                                if (comment.commentId) setEditingComment({ id: comment.commentId, content: comment.content });
                                setOpenMenuIndex(null);
                              }}
                            >
                              {t("comments_modal_menu_edit")}
                            </button>
                            <button
                              className="comments-modal-menu-item"
                              onClick={() => {
                                if (comment.commentId) setDeleteCommentId(comment.commentId);
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

      {deleteCommentId && (
        <div className="comments-popup-overlay" onPointerDown={(e) => e.stopPropagation()}>
          <div className="comments-popup-modal">
             <h4 className="comments-popup-title">{t("comments_modal_delete_title")}</h4>
             <p className="comments-popup-text">{t("dish_settings_modal_delete_confirm_title")}</p>
             <div className="comments-popup-actions">
               <button className="comments-popup-btn cancel" onClick={() => setDeleteCommentId(null)}>
                 {t("comments_modal_delete_cancel")}
               </button>
               <button className="comments-popup-btn confirm" onClick={confirmDelete}>
                 {t("comments_modal_delete_confirm")}
               </button>
             </div>
          </div>
        </div>
      )}

      {editingComment && (
        <div className="comments-popup-overlay" onPointerDown={(e) => e.stopPropagation()}>
          <div className="comments-popup-modal">
             <h4 className="comments-popup-title">{t("comments_modal_edit_title")}</h4>
             
             <div className="comments-edit-input-wrapper">
                <textarea 
                  className="comments-edit-textarea"
                  value={editingComment.content}
                  onChange={(e) => {
                      const val = e.target.value;
                      setEditingComment(prev => prev ? { ...prev, content: val } : null);
                  }}
                  maxLength={MAX_COMMENT_LENGTH}
                />
                <div className="comments-modal-counter" style={{ bottom: '1rem', right: '1rem' }}>
                    {editingComment.content.length}/{MAX_COMMENT_LENGTH}
                </div>
             </div>

             <div className="comments-popup-actions">
               <button className="comments-popup-btn cancel" onClick={() => setEditingComment(null)}>
                 {t("comments_modal_edit_cancel")}
               </button>
               <button className="comments-popup-btn save" onClick={confirmEdit}>
                 {t("comments_modal_edit_confirm")}
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
