using System.Collections.Generic;
using System.Threading.Tasks;
using api.Models;

namespace api.Services
{
    public interface IProjectExternalIdService
    {
        Task<List<string>> UpdateExistingProjectWithExternalId();
    }
}
