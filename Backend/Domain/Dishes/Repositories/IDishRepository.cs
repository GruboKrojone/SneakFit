using Core.Database;
using Domain.Dishes.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Dishes.Repositories;

internal interface IDishRepository : IEntityRepository<Dish>
{
}
