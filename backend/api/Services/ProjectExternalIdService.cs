using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using api.Context;
using api.Models;
using datasheetapi.Services;
using Microsoft.EntityFrameworkCore;

namespace api.Services
{
    public class ProjectExternalIdService : IProjectExternalIdService
    {
        private readonly BmtDbContext _context;
        private readonly IFusionService FusionService;

        public ProjectExternalIdService(BmtDbContext context, IFusionService fusionService)
        {
            _context = context;
            FusionService = fusionService;
        }

        // 1. Get project from fusion based on contextId
        // 2. Get externalId from project
        // 3. Update project with externalId
        // 4. Save updated project

        public async Task<List<string>> UpdateExistingProjectWithExternalId()
        {
            var updatedProjectIds = new List<string>();
            var projectsWithoutExternalId = await _context.Projects.Where(project => project.ExternalId == null || project.ExternalId == Guid.Empty.ToString()).ToListAsync();

            foreach (var project in projectsWithoutExternalId)
            {
                if (string.IsNullOrEmpty(project.FusionProjectId) || project.FusionProjectId == Guid.Empty.ToString())
                {
                    continue;
                }
                var fusionProject = await FusionService.ProjectMasterAsync(project.FusionProjectId);
                if (fusionProject == null || fusionProject.ExternalId == null || fusionProject.ExternalId == Guid.Empty.ToString())
                {
                    continue;
                }

                project.ExternalId = fusionProject.ExternalId;
                _context.Projects.Update(project);
                updatedProjectIds.Add(project.Id);
            }

            await _context.SaveChangesAsync();

            return updatedProjectIds;
        }
    }
}
