import { useEffect, useState } from "react";

const Loading = ({ isFetching }: { isFetching: boolean }) => {
  const [loadPercentage, setLoadPercentage] = useState(0);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    let bufferId: NodeJS.Timer;
    let hideId: NodeJS.Timer;

    if (isFetching) {
      setHidden(false);
      setLoadPercentage(30);

      bufferId = setInterval(
        () =>
          setLoadPercentage((previous) => {
            if (previous < 80) {
              return previous + 5;
            }

            clearInterval(bufferId);
            return previous;
          }),
        100,
      );
    } else {
      setLoadPercentage(100);

      hideId = setTimeout(() => {
        setHidden(true);
        setLoadPercentage(0);
      }, 700);
    }

    return () => {
      clearInterval(bufferId);
      clearTimeout(hideId);
    };
  }, [isFetching]);

  return (
    <div
      style={{ width: loadPercentage + "%" }}
      className={`${
        hidden ? "opacity-0" : "opacity-100"
      } absolute top-0 left-0 h-2 bg-red-400 w-10 transition-[width] duration-700`}
    />
  );
};

export default Loading;
