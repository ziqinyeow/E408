import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PostCard from "../components/PostCard";
import { GetServerSideProps } from "next";
import { prisma } from "../lib/prisma";
import { Post, Quote } from "@prisma/client";
import QuoteCard from "../components/QuoteCard";
import Countdown from "../components/Countdown";

const data = {
  name: "Lee Tian Sienz",
  title: "e408 网红之路",
  section_title: ["名句精华", "网红档案、素材"],
  job: [
    { name: "Lee Tian Sienz", job: ["网红"] },
    { name: "Wong Li De", job: ["网红的室友", "幕后摄影师"] },
    { name: "Yeow Zi Qin", job: ["网红的室友", "网页工程师"] },
  ],
};

interface Props {
  posts: Post[];
  quotes: Quote[];
}

const Home: NextPage<Props> = ({ posts, quotes }) => {
  const router = useRouter();
  const [access, setAccess] = useState(false);
  const [cardShow, setCardShow] = useState(0);
  const [quoteCardShow, setQuoteCardShow] = useState(0);
  const [updatedPosts, setUpdatedPosts] = useState<Post[] | []>();
  const [likes, setLikes] = useState<number[]>([]);

  useEffect(() => {
    getAllLike();
    try {
      // @ts-ignore
      const key = window.localStorage.getItem(
        "sdafopfjerhenginadfsvionamsiodnkasfsd-dsf-asdfdasdif"
      );
      if (key && key === process.env.NEXT_PUBLIC_VALUE) {
        setAccess(true);
      } else {
        router.push("/");
      }
    } catch (error) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAllLike = () => {
    const updated = posts.map((post) => {
      // @ts-ignore
      setLikes((prev) => [...prev, post.like]);
      const key = window.localStorage.getItem(post?.id);
      // @ts-ignore
      post.liked = Boolean(key);
      return post;
    });
    setUpdatedPosts(updated);
  };

  const toggleLike = async (id: string, i: number) => {
    try {
      if (!updatedPosts) {
        return;
      }
      // @ts-ignore
      const key = window.localStorage.getItem(id);
      if (!key || (key && key === "false")) {
        window.localStorage.setItem(id, "true");
        // +1
        let temp = [...likes];
        let e = temp[i];
        e = e + 1;
        temp[i] = e;
        setLikes(temp);
        await fetch("/api/post/like", {
          method: "POST",
          body: JSON.stringify({
            key: process.env.NEXT_PUBLIC_KEY,
            id,
            increment: true,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else if (key && key === "true") {
        window.localStorage.setItem(id, "false");
        // -1
        let temp = [...likes];
        let e = temp[i];
        e = e - 1;
        temp[i] = e;
        setLikes(temp);
        await fetch("/api/post/like", {
          method: "POST",
          body: JSON.stringify({
            key: process.env.NEXT_PUBLIC_KEY,
            id,
            increment: false,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {}
  };

  return (
    <div>
      <Head>
        <title>E408</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="w-full h-56 mb-5 bg">
        <div className="relative w-full h-full layout">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/profile.jpg"
            alt="profile"
            className="absolute object-cover rounded-full w-28 -bottom-10 ring-4 ring-white h-28"
          />
          {access && (
            <button
              type="button"
              className="absolute right-0 flex px-5 py-2 font-bold text-white rounded bottom-5"
              onClick={() => setCardShow(1)}
            >
              Story
            </button>
          )}
          {access && (
            <button
              type="button"
              className="absolute flex px-5 py-2 font-bold text-white rounded right-16 bottom-5"
              onClick={() => setQuoteCardShow(1)}
            >
              Quote
            </button>
          )}
        </div>
      </div>
      <div className="w-full layout">
        <div className="flex items-center w-full mb-10 space-x-5">
          <h1>{data.name}</h1>
          <h3>{data.title}</h3>
        </div>
        <div className="w-full mb-20">
          <h2 className="mb-5">{data.section_title[0]}</h2>
          <div className="grid grid-cols-2 gap-5">
            {quotes?.map((q) => (
              <div key={q.id} className="w-full p-5 rounded shadow">
                <h3>{q.title}</h3>
                <h5 className="text-sm text-gray-400">{q.createdAt}</h5>
              </div>
            ))}
          </div>
        </div>
        <h2 className="mb-5">{data.section_title[1]}</h2>
        <div className="grid gap-5 md:grid-cols-3 sm:grid-cols-2">
          {updatedPosts?.map((post: Post | any, i) => {
            const liked = window.localStorage.getItem(post?.id);
            return (
              <div
                key={post.id}
                className="flex flex-col justify-between p-4 border rounded-md"
              >
                <div>
                  <h3 className="mb-2 text-justify">{post?.title}</h3>
                  <h5 className="mb-4 text-justify">{post?.description}</h5>
                  <div className="mb-5 text-xs text-gray-500">
                    {new Date(post?.createdAt).toDateString()}
                  </div>
                </div>
                <div>
                  {post?.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post?.url}
                      alt={post?.id}
                      className="object-cover w-full pointer-events-none select-none max-h-80"
                    />
                  ) : (
                    <div>
                      <video
                        src={post?.url}
                        controls
                        className="w-full select-none max-h-80"
                      ></video>
                    </div>
                  )}
                  <div className="grid w-full grid-cols-2 gap-5 mt-5">
                    <button
                      onClick={(e) => {
                        toggleLike(post?.id, i);
                      }}
                      className={`p-5 rounded-md flex justify-around group ${
                        liked && liked === "true"
                          ? "bg-gray-300 transition-all duration-300"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {liked && liked === "true" ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          className={`text-gray-500 group-hover:text-gray-800 transition-all duration-500 `}
                        >
                          <path fill="none" d="M0 0h24v24H0z" />
                          <path
                            fill="currentColor"
                            d="M2 9h3v12H2a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zm5.293-1.293l6.4-6.4a.5.5 0 0 1 .654-.047l.853.64a1.5 1.5 0 0 1 .553 1.57L14.6 8H21a2 2 0 0 1 2 2v2.104a2 2 0 0 1-.15.762l-3.095 7.515a1 1 0 0 1-.925.619H8a1 1 0 0 1-1-1V8.414a1 1 0 0 1 .293-.707z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          className={`text-gray-500 group-hover:text-gray-800 transition-all duration-500 `}
                        >
                          <path fill="none" d="M0 0h24v24H0z" />
                          <path
                            fill="currentColor"
                            d="M14.6 8H21a2 2 0 0 1 2 2v2.104a2 2 0 0 1-.15.762l-3.095 7.515a1 1 0 0 1-.925.619H2a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1h3.482a1 1 0 0 0 .817-.423L11.752.85a.5.5 0 0 1 .632-.159l1.814.907a2.5 2.5 0 0 1 1.305 2.853L14.6 8zM7 10.588V19h11.16L21 12.104V10h-6.4a2 2 0 0 1-1.938-2.493l.903-3.548a.5.5 0 0 0-.261-.571l-.661-.33-4.71 6.672c-.25.354-.57.644-.933.858zM5 11H3v8h2v-8z"
                          />
                        </svg>
                      )}
                    </button>
                    <div
                      className={`p-5 rounded-md flex text-gray-500 justify-around group bg-gray-50`}
                    >
                      {likes[i]}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="w-full my-20">
          <h2>幕后备胎</h2>
          <div className="grid w-full grid-cols-3 gap-5 mt-5">
            {data.job.map((j) => (
              <div
                key={j.name}
                className="flex flex-col items-center justify-center p-4 border"
              >
                <div>{j.name}</div>
                {j.job.map((_j) => (
                  <div key={_j}>{_j}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="w-full">
          <h2 className="mb-5">你还有</h2>
          <Countdown />
          <div className="flex justify-end w-full">
            <h2 className="my-10">来准备生日礼物哦 !</h2>
          </div>
        </div>
        <PostCard show={cardShow} setShow={setCardShow} />
        <QuoteCard show={quoteCardShow} setShow={setQuoteCardShow} />
      </div>
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const posts: Post[] = await prisma.post.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  const quotes: Quote[] = await prisma.quote.findMany({
    orderBy: {
      createdAt: "asc",
    },
  });

  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
      quotes: JSON.parse(JSON.stringify(quotes)),
    },
  };
};
