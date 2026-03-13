import { readFileSync } from 'fs';

const flowJson = JSON.parse(readFileSync('/vercel/share/v0-project/flow-definition.json', 'utf8'));

console.log("=== POWER AUTOMATE FLOW ANALYSIS ===\n");
console.log("Flow Name:", flowJson.properties.displayName);
console.log("Flow ID:", flowJson.id);

const definition = flowJson.properties.definition;

console.log("\n=== TRIGGER ===");
console.log(JSON.stringify(definition.triggers, null, 2));

console.log("\n=== ACTIONS ===");
Object.entries(definition.actions).forEach(([name, action]) => {
  console.log(`\n--- Action: ${name} ---`);
  console.log("Type:", action.type);
  console.log("Runs After:", JSON.stringify(action.runAfter));
  if (action.inputs) {
    console.log("Inputs:", JSON.stringify(action.inputs, null, 2));
  }
  if (action.actions) {
    console.log("Nested Actions:", Object.keys(action.actions));
    Object.entries(action.actions).forEach(([nestedName, nestedAction]) => {
      console.log(`  - ${nestedName}:`, nestedAction.type);
      if (nestedAction.inputs) {
        console.log("    Inputs:", JSON.stringify(nestedAction.inputs, null, 2));
      }
    });
  }
});
