using Microsoft.AspNetCore.Authorization;
using Microsoft.Identity.Web.Resource;
using Microsoft.AspNetCore.Mvc;
using api.Services;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;

namespace datasheetapi.Controllers;

[ApiController]
[Route("externalid")]
[Authorize]
[RequiredScope(RequiredScopesConfigurationKey = "AzureAd:Scopes")]

public class ProjectExternalIdController : ControllerBase
{
    private readonly IProjectExternalIdService _projectExternalIdService;
    private readonly ILogger<ProjectExternalIdController> _logger;

    public ProjectExternalIdController(ILoggerFactory loggerFactory, IProjectExternalIdService projectExternalIdService)
    {
        _logger = loggerFactory.CreateLogger<ProjectExternalIdController>();
        _projectExternalIdService = projectExternalIdService;
    }

    [HttpPost(Name = "UpdateExistingProjectWithExternalId")]
    public async Task<ActionResult<List<string>>> UpdateExistingProjectWithExternalId()
    {
        Console.WriteLine("UpdateExistingProjectWithExternalId");
        var result = await _projectExternalIdService.UpdateExistingProjectWithExternalId();
        return Ok(result);
    }
}
