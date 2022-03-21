import path from "path";
import { createResourceCommand } from "../commands";

// TODO: figure out mocking of fs
// import { fs, vol } from "memfs";

// jest.mock("fs");
// jest.mock("fs/promises");

describe("workflows end-to-end", () => {
  describe("create-resource", () => {
    beforeEach(() => {
      // vol.reset(); // reset the virtual filesystem
    });

    it("writes a new resource spec file to resources dir", async () => {
      const command = createResourceCommand();

      let stdout = "";
      let stderr = "";

      command.configureOutput({
        writeOut: (str) => (stdout += str),
        writeErr: (str) => (stderr += str),
      });
      command.exitOverride();

      await command.parseAsync(["User", "Users"], { from: "user" });

      expect(stdout).toMatchSnapshot();
    });
  });
});
