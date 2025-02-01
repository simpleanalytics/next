import Link from "next/link";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { redirect } from "next/navigation";

interface PackageCommandProps {
  code: string;
}

function PackageCommand({ code }: PackageCommandProps) {
  return (
    <DynamicCodeBlock
      lang="bash"
      code={code}
      options={{
        components: {
          // add/override components
        },
        // or Shiki options
      }}
    />
  );
}

export default function HomePage() {
  redirect("/docs");

  // return (
  //   <main className="flex flex-1 flex-col justify-center text-center container items-center">
  //     <h1 className="mb-4 text-2xl font-bold">Hello World</h1>
  //     <p className="text-fd-muted-foreground">
  //       You can open{" "}
  //       <Link
  //         href="/docs"
  //         className="text-fd-foreground font-semibold underline"
  //       >
  //         /docs
  //       </Link>{" "}
  //       and see the documentation.
  //     </p>
  //
  //     <Tabs className="max-w-96 w-full" items={['npm', 'pnpm', 'yarn', 'bun', "deno"]}>
  //       <Tab value="npm">
  //         <PackageCommand code="npm i @simpleanalytics/next" />
  //       </Tab>
  //       <Tab value="pnpm">
  //         <PackageCommand code="pnpm i @simpleanalytics/next" />
  //       </Tab>
  //       <Tab value="yarn">
  //         <PackageCommand code="yarn add @simpleanalytics/next" />
  //       </Tab>
  //       <Tab value="bun">
  //         <PackageCommand code="bun add @simpleanalytics/next" />
  //       </Tab>
  //       <Tab value="deno">
  //         <PackageCommand code="deno add npm:@simpleanalytics/next" />
  //       </Tab>
  //     </Tabs>
  //   </main>
  // );
}
