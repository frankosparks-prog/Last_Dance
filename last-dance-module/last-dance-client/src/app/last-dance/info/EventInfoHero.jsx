// const HERO_IMAGE =
//   'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=2000&q=90';

// export default function EventInfoHero() {
//   return (
//     <section
//       className="
//         relative
//         h-[420px]
//         w-full
//         overflow-hidden
//         bg-black

//         sm:h-[440px]

//         lg:h-[600px]
//       "
//       style={{
//         fontFamily: 'Roboto, sans-serif',
//       }}
//     >
//       {/* =====================================================
//           BACKGROUND IMAGE

//           Recommended source:
//           2000 × 1200px

//           Premium/high-density option:
//           2400 × 1440px
//       ====================================================== */}

//       <img
//         src={HERO_IMAGE}
//         alt="Last Dance Graduation Eve Festival"
//         className="
//           absolute
//           inset-0
//           h-full
//           w-full
//           object-cover
//           object-center
//         "
//       />

//       {/* =====================================================
//           DARK OVERLAY
//       ====================================================== */}

//       <div
//         className="
//           absolute
//           inset-0
//           bg-black/40
//         "
//       />

//       {/* =====================================================
//           CONTENT
//       ====================================================== */}

//       <div
//         className="
//           relative
//           z-10
//           mx-auto
//           flex
//           h-full
//           w-full
//           max-w-[1180px]
//           items-center
//           px-4

//           sm:px-6

//           lg:px-4
//         "
//       >
//         <div
//           className="
//             max-w-[820px]
//           "
//         >
//           <p
//             className="
//               text-[13px]
//               font-medium
//               text-[#ff914d]

//               sm:text-[14px]
//             "
//           >
//             October 26th, 2026
//             <span className="mx-2 text-white/60">
//               •
//             </span>
//             Graduation Eve Festival
//           </p>

//           <h1
//             className="
//               mt-4
//               text-[34px]
//               font-normal
//               leading-[1.12]
//               tracking-[-0.02em]
//               text-white

//               sm:text-[40px]

//               lg:text-[42px]
//               lg:leading-[1.1]
//             "
//           >
//             One unforgettable night to
//             celebrate the end of the
//             journey together.
//           </h1>
//         </div>
//       </div>
//     </section>
//   );
// }









'use client';

import React, {
  useEffect,
  useState,
} from 'react';

/* =========================================================
   HERO IMAGE
========================================================= */

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=2000&q=90';

/* =========================================================
   GRADUATION DATE

   November 27th, 2026
   East Africa Time
========================================================= */

const EVENT_DATE =
  new Date(
    '2026-11-27T00:00:00+03:00'
  ).getTime();

/* =========================================================
   EMPTY TIMER

   Starting with zeros prevents server/client hydration
   differences before JavaScript mounts.
========================================================= */

const INITIAL_TIME = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  finished: false,
};

/* =========================================================
   CALCULATE TIME LEFT
========================================================= */

function calculateTimeLeft() {
  const now =
    Date.now();

  const distance =
    EVENT_DATE - now;

  if (distance <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      finished: true,
    };
  }

  const day =
    1000 * 60 * 60 * 24;

  const hour =
    1000 * 60 * 60;

  const minute =
    1000 * 60;

  return {
    days:
      Math.floor(
        distance / day
      ),

    hours:
      Math.floor(
        (distance % day) /
          hour
      ),

    minutes:
      Math.floor(
        (distance % hour) /
          minute
      ),

    seconds:
      Math.floor(
        (distance % minute) /
          1000
      ),

    finished: false,
  };
}

/* =========================================================
   COUNTDOWN CUBE
========================================================= */

function CountdownCube({
  value,
  label,
}) {
  const displayValue =
    String(value).padStart(
      2,
      '0'
    );

  return (
    <div
      className="
        min-w-0
      "
    >
      {/* =============================================
          NUMBER CUBE

          `key` forces the cube to remount when its
          displayed number changes. That reruns the
          forward-flip animation.
      ============================================= */}

      <div
        key={`${label}-${displayValue}`}
        className="
          countdown-cube
          flex
          h-[68px]
          w-full
          items-center
          justify-center
          bg-[#762e99]

          sm:h-[78px]

          lg:h-[86px]
        "
      >
        <span
          className="
            text-[27px]
            font-medium
            leading-none
            tracking-[-0.03em]
            text-[#ff914d]

            sm:text-[32px]

            lg:text-[38px]
          "
        >
          {displayValue}
        </span>
      </div>

      {/* =============================================
          LABEL
      ============================================= */}

      <p
        className="
          mt-2
          text-center
          text-[9px]
          font-medium
          uppercase
          tracking-[0.08em]
          text-white/65

          sm:text-[10px]

          lg:text-[11px]
        "
      >
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   HERO COMPONENT
========================================================= */

function EventInfoHero() {
  const [
    timeLeft,
    setTimeLeft,
  ] = useState(
    INITIAL_TIME
  );

  /* =======================================================
     ACTIVE COUNTDOWN

     Updates every second.
  ======================================================= */

  useEffect(() => {
    const updateTimer =
      () => {
        setTimeLeft(
          calculateTimeLeft()
        );
      };

    updateTimer();

    const timer =
      window.setInterval(
        updateTimer,
        1000
      );

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, []);

  return (
    <section
      className="
        relative
        h-[420px]
        w-full
        overflow-hidden
        bg-black

        sm:h-[440px]

        lg:h-[600px]
      "
      style={{
        fontFamily:
          'Roboto, sans-serif',
      }}
    >
      {/* =====================================================
          BACKGROUND IMAGE

          Recommended:
          2000 × 1200px

          Premium:
          2400 × 1440px
      ====================================================== */}

      <img
        src={HERO_IMAGE}
        alt="Last Dance Graduation Eve Festival"
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
          object-center
        "
      />

      {/* =====================================================
          DARK OVERLAY
      ====================================================== */}

      <div
        className="
          absolute
          inset-0
          bg-black/40
        "
      />

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          h-full
          w-full
          max-w-[1180px]
          items-center
          px-4

          sm:px-6

          lg:px-4
        "
      >
        <div
          className="
            w-full
            max-w-[820px]
          "
        >
          {/* =============================================
              DATE
          ============================================= */}

          <p
            className="
              text-[13px]
              font-medium
              text-[#ff914d]

              sm:text-[14px]
            "
          >
            November 27th, 2026

            <span
              className="
                mx-2
                text-white/60
              "
            >
              •
            </span>

            Graduation Eve Festival
          </p>

          {/* =============================================
              HEADING
          ============================================= */}

          <h1
            className="
              mt-4
              max-w-[780px]
              text-[34px]
              font-normal
              leading-[1.12]
              tracking-[-0.02em]
              text-white

              sm:text-[40px]

              lg:text-[42px]
              lg:leading-[1.1]
            "
          >
            One unforgettable night
            to celebrate the end of
            the journey together.
          </h1>

          {/* =================================================
              COUNTDOWN
          ================================================== */}

          <div
            className="
              mt-7
              w-full
              max-w-[520px]

              sm:mt-8

              lg:mt-9
            "
          >
            {!timeLeft.finished ? (
              <>
                <p
                  className="
                    mb-3
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.1em]
                    text-white/70

                    sm:text-[12px]
                  "
                >
                  Countdown to graduation
                </p>

                <div
                  className="
                    grid
                    grid-cols-4
                    gap-2

                    sm:gap-3
                  "
                >
                  <CountdownCube
                    value={
                      timeLeft.days
                    }
                    label="Days"
                  />

                  <CountdownCube
                    value={
                      timeLeft.hours
                    }
                    label="Hours"
                  />

                  <CountdownCube
                    value={
                      timeLeft.minutes
                    }
                    label="Minutes"
                  />

                  <CountdownCube
                    value={
                      timeLeft.seconds
                    }
                    label="Seconds"
                  />
                </div>
              </>
            ) : (
              <div
                className="
                  inline-flex
                  bg-[#762e99]
                  px-5
                  py-4
                "
              >
                <p
                  className="
                    text-[16px]
                    font-medium
                    text-[#ff914d]
                  "
                >
                  Graduation Day is here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          FLIP ANIMATION

          Plain <style> instead of styled-jsx.
          This avoids adding another React/Next component
          dependency to the hero.
      ====================================================== */}

      <style>
        {`
          .countdown-cube {
            transform-origin: center top;
            backface-visibility: hidden;
            animation:
              countdown-forward
              420ms
              cubic-bezier(0.22, 1, 0.36, 1);
          }

          @keyframes countdown-forward {
            0% {
              opacity: 0.3;
              transform:
                perspective(500px)
                rotateX(-40deg)
                translateY(-4px);
            }

            55% {
              opacity: 1;
              transform:
                perspective(500px)
                rotateX(5deg)
                translateY(1px);
            }

            100% {
              opacity: 1;
              transform:
                perspective(500px)
                rotateX(0deg)
                translateY(0);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .countdown-cube {
              animation: none;
            }
          }
        `}
      </style>
    </section>
  );
}

export default EventInfoHero;