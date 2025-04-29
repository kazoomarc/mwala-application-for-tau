"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  // start of ai gen code

  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Convert to UTC+2 (Zomba time)
      const zombaTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Africa/Blantyre" })
      );
      const formatted = zombaTime
        .toTimeString()
        .split(" ")[0]
        .split(":")
        .slice(0, 3)
        .join(" : ");
      setTime(formatted);
    };

    updateTime(); // Initial call
    const interval = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(interval); // Clean up on unmount
  }, []);
  // start of ai gen code

  return (
    <div
      className="flex justify-center "
      // start of ai gen code
      style={{
        backgroundImage:
          "repeating-linear-gradient(45deg, rgb(255, 255, 255) 0px, rgb(248, 248, 248) 2px, transparent 2px, transparent 10px)",
      }}
      // end of ai gen code
    >
      <div className="p-5 pb-20 max-w-[1024px] text-slate-800 md:p-20 font-[family-name:var(--font-bricolage-sans)] bg-slate-100">
        <div>
          <div>
            <div className="flex items-center gap-2">
              <div className="h-[14px] w-[14px] rounded-full bg-red-400"></div>
              <span className="text-xl md:text-2xl">
                Zomba <span className="text-red-400 text-">[ {time} ]</span>
              </span>
            </div>
            <h1 className="text-[44px] md:text-[64px] font-extrabold">
              Hey It’s, <span className="text-red-400">Joel</span>
            </h1>
          </div>
          <div>
            <p className="font-medium text-xl md:text-[28px] max-w-[944px] mt-[34px]">
              Hello Taugombera, Saw your post in Geek Quest looking for someone
              to build software with. I’m very interested myself and i think i
              quietly fit the description. Im a third year CS student at UNIMA.
              I’m very familiar with front-end stuff (ie React, Next.js, HTML
              and tailwind css) and I have working knowledge of django.
            </p>
            <div>
              <p className="font-medium text-xl md:text-[28px] mt-9">
                Here are some websites i built
              </p>
            </div>
            <p className="font-medium text-xl md:text-[28px] mt-9 max-w-[944px]">
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

            <p className="font-medium text-xl md:text-[28px] mt-[18px]">
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
            <p className="font-medium text-xl md:text-[28px] mt-[18px] max-w-[944px]">
              Since you’re looking for someone who will be using AI efficiently.
              I have decided to build these 3 mini projects.
            </p>
          </div>

          <div>
            <ul className="mt-6 pl-6">
              <li>
                <Link
                  href="/projects/image-editor"
                  className="font-medium text-xl md:text-[28px] underline text-green-600"
                >
                  1. Image Editor &rarr;{" "}
                </Link>
              </li>
              <li>
                <Link
                  href="/projects/sound-machine"
                  className="font-medium text-xl md:text-[28px] underline text-green-600"
                >
                  2. Sound Machine &rarr;{" "}
                </Link>
              </li>
              <li>
                <Link
                  href="/projects/color-gradient"
                  className="font-medium text-xl md:text-[28px] underline text-green-600"
                >
                  3. Gradient Generator &rarr;{" "}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h1 className="font-semibold text-4xl mt-14">
              Colophon{" "}
              <span className="text-red-400">&lt;behind this web page&gt;</span>
            </h1>
            <p className="font-medium text-xl md:text-[28px] mt-[18px] max-w-[944px]">
              This site was designed in Figma for tablet and mobile version.
              Font used is{" "}
              <span className="font-bold">Bricolage Grotesque</span> and{" "}
              <span className="font-bold">Fira mono</span> from google fonts.
              The colours used are from tailwind design system with page
              background:{" "}
              <span className="bg-slate-800 text-slate-100 rounded-lg px-5 text-[18px]">
                [slate-100 ]
              </span>{" "}
              text-color:{" "}
              <span className="bg-red-100 text-slate-800 rounded-lg px-5 text-[18px]">
                [slate-800 ]
              </span>{" "}
              links:{" "}
              <span className="bg-red-400 text-slate-500 rounded-lg px-5 text-[18px]">
                [slate-500 ]
              </span>{" "}
              project links:{" "}
              <span className="bg-slate-100 text-green-700 rounded-lg px-5 text-[18px]">
                [green-700 ]
              </span>{" "}
              Decorative red{" "}
              <span className="bg-red-100 text-red-400 rounded-lg px-5 text-[18px]">
                [red-400]
              </span>
            </p>
            <p className="font-medium text-xl md:text-[28px] mt-[18px] max-w-[944px]">
              It was built using Next.js and tailwind.css and deployed on
              vercel. The source code of the page can be found here
              <a href="https://github.com/kazoomarc/mwala-application-for-tau"></a>(github_repo)</a>. The parts that were heavily AI assisted are
              commented with{" "}
              <span className="font-[family-name:var(--font-fira-mono)]">
                // --start of AI generated code--
              </span>{" "}
              and{" "}
              <span className="font-[family-name:var(--font-fira-mono)]">
                // -- end of AI generated code
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

//
//
//
// the ai used this code to comeup with the app preview in the projects
//
//
//
function Project() {
  return (
    <div className="mt-[68px]">
      <div>
        <h2 className="font-semibold text-slate-800 text-2xl md:text-4xl">
          Title of project
        </h2>
      </div>
      <div
        className="bg-slate-50 border border-slate-400 rounded-sm mt-6"
        // start of ai gen code
        style={{
          backgroundImage: `radial-gradient(circle, rgb(254, 226, 226) 4px, transparent 4px)`,
          backgroundSize: `12px 12px`,
        }}
        // end of ai gen code
      >
        <div className="bg-slate-50 border border-slate-400 m-4 md:m-[40px] rounded-sm min-h-[600px]"></div>
      </div>
      <div>
        <p className="text-xl md:text-[28px] font-medium mt-6">
          Description of what the project is about. how to actually interact
          with the project and what it achieves. What AI is used and how.
        </p>
      </div>
    </div>
  );
}
