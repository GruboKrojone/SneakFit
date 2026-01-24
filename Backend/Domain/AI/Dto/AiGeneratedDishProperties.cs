using Domain.Categories.Entities;
using Domain.Users.Enums;

namespace Domain.AI.Dto;

public record AiGeneratedDishProperties(
    List<Category> Categories,
    List<DishTaste> Tastes,
    List<KitchenItem> RequiredTools,
    Lang Lang = Lang.EN
    );