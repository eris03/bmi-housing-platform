import { base } from "@bmi/config/eslint";
export default [...base, { ignores: ["prisma/migrations/**"] }];
