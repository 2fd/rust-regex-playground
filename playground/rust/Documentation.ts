export interface DocumentationOptions {
  baseUrl: string;
  pkg: string;
  version: string;
}

export default class Documentation {
  static fromPackage(name: string, version: string) {
    return new Documentation({
      baseUrl: "https://docs.rs",
      pkg: name,
      version
    });
  }

  constructor(public readonly options: DocumentationOptions) {}

  getUrlPath(type: string, name: string, variant?: string) {
    const sections = name.split("::");
    const lastSection = sections.pop();
    return (
      sections.join("/") +
      "/" +
      type +
      "." +
      lastSection +
      ".html" +
      (variant ? "#variant." + variant : "")
    );
  }

  getUrl(type: string, name: string, variant?: string) {
    return [
      this.options.baseUrl,
      this.options.pkg,
      this.options.version,
      this.getUrlPath(type, name, variant)
    ].join("/");
  }
}
