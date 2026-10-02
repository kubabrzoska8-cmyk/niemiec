/** Generuje data/kurs.schema.json ze schematu zod (src/lib/schema.ts). Uruchom: npm run schemat */
import fs from "node:fs";
import { schematJson } from "../src/lib/schemat-json.ts";

const cel = new URL("../../data/kurs.schema.json", import.meta.url);
fs.writeFileSync(cel, JSON.stringify(schematJson(), null, 2) + "\n");
console.log(`✅ zapisano ${cel.pathname}`);
