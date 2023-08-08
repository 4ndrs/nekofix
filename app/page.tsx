"use client";

import Image from "next/image";

const Page = () => {
  return (
    <main>
      <Image
        alt="image of a catgirl"
        src="https://placeneko.com/api/random"
        width={300}
        height={300}
        className="h-screen object-cover w-auto max-w-full mx-auto"
      />
    </main>
  );
};

export default Page;
