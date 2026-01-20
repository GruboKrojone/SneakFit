using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Domain.Migrations
{
    /// <inheritdoc />
    public partial class Favorited : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserFavoriteDishes");

            migrationBuilder.CreateTable(
                name: "Favorited",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    DishId = table.Column<int>(type: "int", nullable: false),
                    Id = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Favorited", x => new { x.UserId, x.DishId });
                    table.ForeignKey(
                        name: "FK_Favorited_Dishes_DishId",
                        column: x => x.DishId,
                        principalTable: "Dishes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Favorited_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Favorited_DishId",
                table: "Favorited",
                column: "DishId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Favorited");

            migrationBuilder.CreateTable(
                name: "UserFavoriteDishes",
                columns: table => new
                {
                    FavoriteDishesId = table.Column<int>(type: "int", nullable: false),
                    FavoritedByUsersId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserFavoriteDishes", x => new { x.FavoriteDishesId, x.FavoritedByUsersId });
                    table.ForeignKey(
                        name: "FK_UserFavoriteDishes_Dishes_FavoriteDishesId",
                        column: x => x.FavoriteDishesId,
                        principalTable: "Dishes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserFavoriteDishes_Users_FavoritedByUsersId",
                        column: x => x.FavoritedByUsersId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserFavoriteDishes_FavoritedByUsersId",
                table: "UserFavoriteDishes",
                column: "FavoritedByUsersId");
        }
    }
}
