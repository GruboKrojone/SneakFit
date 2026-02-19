import AuthService from "./AuthService";
import i18n from "../translations/service/i18n";

export interface Comment {
  id?: number;
  commentId?: number;
  content: string;
  authorId: number;
  dishId: number;
  userName?: string;
}

class CommentsService {
  private static readonly baseUrl = "https://localhost:7059/comment";

  static async getCommentsByDishId(dishId: number): Promise<Comment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${dishId}/all`, {
        method: "GET",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          ...AuthService.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(i18n.t("comments_service_fetch_failed"));
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  }

  static async addComment(dishId: number, content: string): Promise<Comment> {
    try {
      const response = await fetch(`${this.baseUrl}/${dishId}/add`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          ...AuthService.getAuthHeader(),
        },
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", response.status, errorText);
        throw new Error(`${i18n.t("comments_service_add_failed")}: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding comment:", error);
      const errorMessage =
        error instanceof Error ? error.message : i18n.t("service_unknown_error");
      throw new Error(`${i18n.t("comments_service_add_failed")}: ${errorMessage}`);
    }
  }

  static async editComment(commentId: number, content: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${commentId}/edit`, {
        method: "PUT",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          ...AuthService.getAuthHeader(),
        },
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", response.status, errorText);
        throw new Error(`${i18n.t("comments_service_edit_failed")}: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Error editing comment:", error);
      const errorMessage =
        error instanceof Error ? error.message : i18n.t("service_unknown_error");
      throw new Error(`${i18n.t("comments_service_edit_failed")}: ${errorMessage}`);
    }
  }

  static async deleteComment(commentId: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${commentId}/delete`, {
        method: "DELETE",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          ...AuthService.getAuthHeader(),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", response.status, errorText);
        throw new Error(`${i18n.t("comments_service_delete_failed")}: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      const errorMessage =
        error instanceof Error ? error.message : i18n.t("service_unknown_error");
      throw new Error(`${i18n.t("comments_service_delete_failed")}: ${errorMessage}`);
    }
  }
}

export default CommentsService;
