import { buildNewResourceSpec } from "../templates/new-resource-spec";
import { addCreateOperationTemplate } from "../templates/operations/create";
import { factsToChangelog, OpenAPIV3 } from "@useoptic/openapi-utilities";
import { newSnykApiCheckService } from "../../service";
import { SynkApiCheckContext } from "../../dsl";
import { parseOpenAPIFromMemory } from "@useoptic/openapi-io";
import { addUpdateOperationTemplate } from "../templates/operations/update";
import { addDeleteOperationTemplate } from "../templates/operations/delete";
import { addGetOperationTemplate } from "../templates/operations/get";
import { addListOperationTemplate } from "../templates/operations/list";

describe("workflow templates", () => {
  describe("operations", () => {
    describe("create", () => {
      checkTemplate(addCreateOperationTemplate);
    });
    describe("delete", () => {
      checkTemplate(addDeleteOperationTemplate);
    });
    describe("get", () => {
      checkTemplate(addGetOperationTemplate);
    });
    describe("list", () => {
      checkTemplate(addListOperationTemplate);
    });
    describe("update", () => {
      checkTemplate(addUpdateOperationTemplate);
    });
  });
});

function checkTemplate(template) {
  it("creates a valid spec", async () => {
    const baseSpec = buildNewResourceSpec("User");
    let updatedSpec: OpenAPIV3.Document = JSON.parse(JSON.stringify(baseSpec));
    template(updatedSpec, {
      titleResourceName: "User",
      resourceName: "user",
      pluralResourceName: "users",
    });
    const results = await check(baseSpec, updatedSpec);
    const failedChecks = results.filter((r) => !r.passed);
    expect(failedChecks.length).toBe(0);
  });
}

const context: SynkApiCheckContext = {
  changeDate: "2021-11-11",
  changeResource: "user",
  changeVersion: {
    date: "2021-11-10",
    stability: "beta",
  },
  resourceVersions: {},
};

async function check(from: OpenAPIV3.Document, to: OpenAPIV3.Document) {
  const checkService = newSnykApiCheckService();
  const { jsonLike: parsedFrom } = await parseOpenAPIFromMemory(from);
  const { jsonLike: parsedTo } = await parseOpenAPIFromMemory(to);
  const { currentFacts, nextFacts } = checkService.generateFacts(
    parsedFrom,
    parsedTo,
  );
  const checkResults = await checkService.runRulesWithFacts({
    context,
    nextFacts,
    currentFacts,
    changelog: factsToChangelog(currentFacts, nextFacts),
    nextJsonLike: to,
    currentJsonLike: from,
  });
  return checkResults;
}