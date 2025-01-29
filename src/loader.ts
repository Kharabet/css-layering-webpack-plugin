import { validate } from "schema-utils";
import { LoaderContext } from "webpack";
import { minimatch } from "minimatch";
import { Schema } from "schema-utils/declarations/validate";

export interface Layer {
  path?: string;
  name: string;
}

export interface LoaderOptions {
  layers: Layer[];
}

export const OPTIONS_SCHEMA = {
  type: "object",
  required: ["layers"],
  properties: {
    layers: {
      type: "array",
      items: {
        type: "object",
        required: ["name"],
        properties: {
          path: {
            description:
              "Files matching this pattern (via minimatch) will be wrapped with this layer. If undefined, the layer will only be included in the layer order declaration.",
            type: "string",
          },
          name: {
            description: "Name of the CSS layer.",
            type: "string",
          },
        },
      },
    },
  },
} as Schema;

export default function (
  this: LoaderContext<LoaderOptions>,
  source: string
): string {
  const options = this.getOptions() as LoaderOptions;
  validate(OPTIONS_SCHEMA, options, { name: "CSS Layering Loader" });

  const layersWithPaths = options.layers.filter((layer) => layer.path);
  const layers = `@layer ${options.layers
    .map((layer) => layer.name)
    .join(", ")};`;
  for (const layer of layersWithPaths) {
    const { path, name } = layer;

    if (path && minimatch(this.resourcePath, path)) {
      return wrapSourceInLayer(source, name, layers);
    }
  }

  return source;
}

function wrapSourceInLayer(
  source: string,
  layerName: string,
  layers: string
): string {
  const lines = source.split("\n");

  const useLines = lines.filter((line) => line.trim().startsWith("@use"));
  const otherLines = lines.filter((line) => !line.trim().startsWith("@use"));

  const useLinesString = useLines.join("\n");
  const otherLinesString = otherLines.join("\n");

  return `${useLinesString}\n${layers}\n@layer ${layerName} {\n${otherLinesString}\n}`;
}
