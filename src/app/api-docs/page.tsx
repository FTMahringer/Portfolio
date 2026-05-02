import { OPENAPI_SPEC } from "@/lib/openapi";
import ApiDocsClient from "./ApiDocsClient";

export const metadata = {
  title: "API Docs",
  description: "OpenAPI documentation for the portfolio REST API.",
};

export default function ApiDocsPage() {
  return <ApiDocsClient spec={OPENAPI_SPEC} />;
}
