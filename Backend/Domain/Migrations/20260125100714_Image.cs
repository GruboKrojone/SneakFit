using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Domain.Migrations
{
    /// <inheritdoc />
    public partial class Image : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MainPictureId",
                table: "Dishes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SecondaryPictureId",
                table: "Dishes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ThirdPicture",
                table: "Dishes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ThirdPictureImageId",
                table: "Dishes",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Images",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Url = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: false),
                    OwnerId = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Images", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Images_Users_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Dishes_MainPictureId",
                table: "Dishes",
                column: "MainPictureId");

            migrationBuilder.CreateIndex(
                name: "IX_Dishes_SecondaryPictureId",
                table: "Dishes",
                column: "SecondaryPictureId");

            migrationBuilder.CreateIndex(
                name: "IX_Dishes_ThirdPictureImageId",
                table: "Dishes",
                column: "ThirdPictureImageId");

            migrationBuilder.CreateIndex(
                name: "IX_Images_OwnerId",
                table: "Images",
                column: "OwnerId");

            migrationBuilder.AddForeignKey(
                name: "FK_Dishes_Images_MainPictureId",
                table: "Dishes",
                column: "MainPictureId",
                principalTable: "Images",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Dishes_Images_SecondaryPictureId",
                table: "Dishes",
                column: "SecondaryPictureId",
                principalTable: "Images",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Dishes_Images_ThirdPictureImageId",
                table: "Dishes",
                column: "ThirdPictureImageId",
                principalTable: "Images",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Dishes_Images_MainPictureId",
                table: "Dishes");

            migrationBuilder.DropForeignKey(
                name: "FK_Dishes_Images_SecondaryPictureId",
                table: "Dishes");

            migrationBuilder.DropForeignKey(
                name: "FK_Dishes_Images_ThirdPictureImageId",
                table: "Dishes");

            migrationBuilder.DropTable(
                name: "Images");

            migrationBuilder.DropIndex(
                name: "IX_Dishes_MainPictureId",
                table: "Dishes");

            migrationBuilder.DropIndex(
                name: "IX_Dishes_SecondaryPictureId",
                table: "Dishes");

            migrationBuilder.DropIndex(
                name: "IX_Dishes_ThirdPictureImageId",
                table: "Dishes");

            migrationBuilder.DropColumn(
                name: "MainPictureId",
                table: "Dishes");

            migrationBuilder.DropColumn(
                name: "SecondaryPictureId",
                table: "Dishes");

            migrationBuilder.DropColumn(
                name: "ThirdPicture",
                table: "Dishes");

            migrationBuilder.DropColumn(
                name: "ThirdPictureImageId",
                table: "Dishes");
        }
    }
}
