import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const MAX_COMMENT_LENGTH = 500;

const commentSchemaType = z.object({
  content: z.string(),
});

type CommentFormData = z.infer<typeof commentSchemaType>;

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchemaType),
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
      await CommentsService.addComment(dishId, data.content.trim());

      const newCommentObj: Comment = {
        content: data.content.trim(),
        authorId: user.id,
        dishId: dishId,
      };

      onCommentAdded(newCommentObj);
      reset();

      toast.success(t("comments_modal_success"));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("comments_modal_error");

      toast.error("✗ " + errorMessage);
    }
  };

  const handleDeleteComment = async (index: number) => {
    const result = await Swal.fire({
      title: t("comments_modal_delete_title"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("comments_modal_delete_confirm"),
      cancelButtonText: t("comments_modal_delete_cancel"),
      customClass: {
        popup: "swal2-popup-custom",
        confirmButton: "swal2-confirm-btn-custom swal2-confirm-delete",
        cancelButton: "swal2-cancel-btn-custom",
      },
    });

    if (result.isConfirmed) {
      try {
        await CommentsService.deleteComment(index);

        const updatedComments = localComments.filter((_, i) => i !== index);
        setLocalComments(updatedComments);

        toast.success(t("comments_modal_delete_success"));
      } catch (err) {
        console.error("Error deleting comment:", err);
        toast.error(t("comments_modal_delete_error"));
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
      confirmButtonText: t("comments_modal_edit_confirm"),
      cancelButtonText: t("comments_modal_edit_cancel"),
      customClass: {
        input: "swal2-textarea-custom",
        popup: "swal2-popup-custom",
        confirmButton: "swal2-confirm-btn-custom",
        cancelButton: "swal2-cancel-btn-custom",
      },
      didOpen: () => {
        const textarea = Swal.getInput() as unknown as HTMLTextAreaElement;
        if (textarea) {
          if (textarea.parentElement) {
            textarea.parentElement.style.position = "relative";
          }

          const counter = document.createElement("div");
          counter.className = "swal2-character-counter";
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

        toast.success(t("comments_modal_edit_success"));
      } catch (err) {
        console.error("Error editing comment:", err);
        toast.error(t("comments_modal_edit_error"));
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
              <span className="error-text" style={{ color: '#ff6b6b' }}>
                {errors.content.message}
              </span>
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

        <div className="comments-modal-list">{localComments.length > 0 ? (
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
