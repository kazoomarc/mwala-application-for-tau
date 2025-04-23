import Image from "next/image";

export default function Home() {
  return (
    <div
      className="flex justify-center "
      // start of ai gen code
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg, rgb(237, 237, 237) 0px, rgb(237, 237, 237) 2px, transparent 2px, transparent 10px)",
      }}
      // end of ai gen code
    >
      <div className=" min-h-screen p-8 pb-20 max-w-[1800px] text-slate-800 sm:p-20 font-[family-name:var(--font-bricolage-sans)] bg-slate-100">
        <div>
          <div>
            <div className="flex items-center gap-2">
              <div className="h-[14px] w-[14px] rounded-full bg-red-400"></div>
              <span>
                Zomba <span className="text-red-400">[ 03: 25 : 09 ]</span>
              </span>
            </div>
            <h1 className="text-[64px] font-extrabold">
              Hey It’s, <span className="text-red-400">Joel</span>
            </h1>
          </div>
          <div>
            <p className="font-medium text-[28px] max-w-[944px] mt-[34px]">
              Hello Taugombera, Saw your post in Geek Quest looking for someone
              to build software with. I’m very interested myself and i think i
              quietly fit the description. Im a third year CS student at UNIMA.
              I’m very familiar with front-end stuff (ie React, Next.js, HTML
              and tailwind css) and I have working knowledge of django.
            </p>
            <div>
              <p className="font-medium text-[28px] mt-9">
                Here are some websites i built
              </p>
            </div>
            <p className="font-medium text-[28px] mt-9 max-w-[944px]">
              BONUS: I’m also a UI designer...and my workflow when building
              anything starts from figma then development. I have lots of my
              work on my twitter{" "}
              <a
                href="https://www.x.com/mwala_joel"
                target="_blank"
                className="text-slate-500 underline"
              >
                @mwala_joel
              </a>
            </p>

            <p className="font-medium text-[28px] mt-[18px]">
              Im building my portfolio here (
              <a
                href="https://mwala-portifolio.vercel.app/"
                target="_blank"
                className="text-slate-500 underline"
              >
                mwala-portifolio.vercel.app/
              </a>
              )
            </p>
            <p className="font-medium text-[28px] mt-[18px] max-w-[944px]">
              Since you’re looking for someone who will be using AI efficiently.
              I have decided to build these 3 mini projects.
            </p>
          </div>
          // projects
          <div></div>
          // end projects
          <div>
            <h1 className="font-semibold text-4xl">
              Colophon{" "}
              <span className="text-red-400">&lt;behind this web page&gt;</span>
            </h1>
            <p className="font-medium text-[28px] mt-[18px] max-w-[944px]">
              This site was designed in Figma for tablet and mobile version.
              Font used is Bricolage Grotesque and Fira mono from google fonts.
              The colours used are from tailwind design system with page
              background
            </p>
            <p className="font-medium text-[28px] mt-[18px] max-w-[944px]">
              It was built using Next.js and tailwind.css and deployed on
              vercel. The source code of the page can be found here
              (github_repo). The parts that were heavily AI assisted are
              commented with <span>// --start of AI generated code--</span> and{" "}
              <span>// -- end of AI generated code</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
