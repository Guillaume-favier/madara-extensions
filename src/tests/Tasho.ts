import { type TestLogger } from "@paperback/types";

import { Tasho } from "../Tasho/main.js";
import sourceInfo from "../Tasho/pbconfig.js";
import { TestSuite, registerDefaultTests } from "./suite.js";

export async function runTests(logger: TestLogger) {
  const suite = new TestSuite("Tasho tests", logger);
  registerDefaultTests(suite, Tasho, sourceInfo);

  await suite.run();
}
