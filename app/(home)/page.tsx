import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/navbar";
import { HomeDemoSection } from "@/components/home/home-demo-section";

export default function HomePage() {
  return (
    <main className="flex h-screen w-full flex-col overflow-auto bg-transparent pt-0 lg:pt-0">
      <div className="relative flex h-[352px] w-full shrink-0 flex-col items-center justify-center overflow-hidden rounded-b-[20px] bg-gray-950 md:border-none lg:h-[480px] lg:rounded-b-[24px] dark:border-b dark:border-b-gray-800">
        <svg
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0"
        >
          <pattern
            id="pattern-checkers"
            x="0"
            y="0"
            width="100%"
            height="26"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-68.23)"
          >
            <line
              x1="0"
              y1="7"
              x2="100%"
              y2="7"
              stroke="#171717"
              strokeDasharray="8 4"
            />
          </pattern>

          <rect
            x="0%"
            y="0"
            width="100%"
            height="100%"
            fill="url(#pattern-checkers)"
          />
        </svg>

        <div className="px-auto z-10 flex w-fit flex-col items-center justify-center gap-4">
          <div className="flex flex-col items-center justify-center gap-1">
            <h1 className="text-center text-2xl leading-[38px] font-[450] tracking-[-0.8px] text-gray-50 lg:text-[32px]">
              Build Better AI Interfaces
            </h1>
            <p className="w-[272px] text-center text-sm leading-6 font-[350] text-gray-400 lg:w-[317px] lg:text-base">
              Beautiful, composable components for building AI-native
              applications.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button
              className="w-fit rounded-full bg-gray-100 text-sm leading-6 font-normal text-gray-900 hover:bg-gray-300"
              asChild
            >
              <Link href="/docs">Get Started</Link>
            </Button>
            <Button
              className="w-fit gap-1.5 rounded-full bg-gray-800 px-4! text-sm leading-6 font-normal text-white hover:bg-gray-700"
              asChild
            >
              <Link
                href="https://github.com/victorcodess/nexus-ui"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubIcon />
                Star on GitHub
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <HomeDemoSection />
    </main>
  );
}
