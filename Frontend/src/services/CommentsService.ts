import AuthService from "./AuthService";

export interface Comment {
  content: string;
  authorId: number;
  dishId: number;
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
        throw new Error("Failed to fetch comments");
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
        throw new Error(`Failed to add comment: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error adding comment:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to add comment: ${errorMessage}`);
    }
  }
}

export default CommentsService;
