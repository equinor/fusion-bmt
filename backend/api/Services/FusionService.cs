namespace api.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Fusion.Integration;
using Fusion.Integration.Profile;
using Microsoft.Extensions.Logging;

using Newtonsoft.Json;

public class FusionService : IFusionService
{
    private readonly IFusionContextResolver _fusionContextResolver;
    private readonly ILogger<FusionService> _logger;
    private readonly IFusionProfileResolver _profileResolver;


    public FusionService(
        IFusionContextResolver fusionContextResolver,
        IFusionProfileResolver profileResolver,
        ILogger<FusionService> logger)
    {
        _fusionContextResolver = fusionContextResolver;
        _profileResolver = profileResolver;
        _logger = logger;
    }

    public async Task<FusionContext> ProjectMasterAsync(string contextId)
    {
        var projectMasterContext = await ResolveProjectMasterContext(contextId);

        // ?: Did we obtain a ProjectMaster context?
        if (projectMasterContext == null)
        {
            // -> No, still not found. Then we log this and fail hard, as the callee should have provided with a
            // valid ProjectMaster (context) ID.
            Console.WriteLine(
                "Could not resolve ProjectMaster context from Fusion using GUID '{ProjectMasterId}'" +
                contextId);
        }

        return projectMasterContext;
    }

    private async Task<FusionContext> ResolveProjectMasterContext(string contextId)
    {
        FusionContext projectMasterContext = await _fusionContextResolver.ResolveContextAsync(contextId, FusionContextType.ProjectMaster);

        Console.WriteLine("ResolveProjectMasterContext - contextId: " + contextId);
        Console.WriteLine("ResolveProjectMasterContext - projectMasterContext: " + projectMasterContext);
        // It might be the GUID provided was the ProjectMaster ID and not the GUID of the Fusion Context. Will
        // thus attempt to query for the ProjectMaster "directly" if not found.
        if (projectMasterContext == null)
        {
            IEnumerable<FusionContext> queryContextsAsync = await _fusionContextResolver.QueryContextsAsync(
                query =>
                {
                    query
                        .WhereTypeIn(FusionContextType.ProjectMaster)
                        .WhereExternalId(contextId.ToString(), QueryOperator.Equals);
                });
            projectMasterContext = queryContextsAsync.FirstOrDefault();
        }

        return projectMasterContext;
    }
}
