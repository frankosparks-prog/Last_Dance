const PROGRAM = [
  {
    time: '06:00 PM',

    title: 'Red Carpet Arrival',

    description:
      'Gate opening, instant QR ticket scanning and the 360° photobooth glam session.',
  },

  {
    time: '07:30 PM',

    title: 'Welcome Toast',

    description:
      'Complimentary welcome drinks and the opening celebration for the graduating class of 2026.',
  },

  {
    time: '09:00 PM',

    title: 'Awards Gala',

    description:
      'Live crowning of Mr & Miss Last Dance alongside winners from the official award categories.',
  },

  {
    time: '10:30 PM',

    eyebrow: 'Till late',

    title: 'Afterparty & Dance',

    description:
      'Non-stop DJ sets, dance floor moments and one final celebration together until late.',
  },
];

export default function EventTimeline() {
  return (
    <section
      className="
        overflow-hidden
        bg-white
        py-20

        sm:py-24

        lg:py-28
      "
      style={{
        fontFamily: 'Roboto, sans-serif',
      }}
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[1180px]
          px-4

          sm:px-6

          lg:px-4
        "
      >
        {/* =====================================================
            SECTION HEADING
        ====================================================== */}

        <div
          className="
            max-w-[720px]
          "
        >
          <p
            className="
              text-[13px]
              font-medium
              text-[#ff914d]
            "
          >
            Event program
          </p>

          <h2
            className="
              mt-2
              text-[32px]
              font-medium
              leading-[1.15]
              tracking-[-0.02em]
              text-black

              sm:text-[38px]

              lg:text-[44px]
            "
          >
            Schedule & Timeline
          </h2>

          <p
            className="
              mt-5
              max-w-[600px]
              text-[16px]
              font-normal
              leading-[1.65]
              text-[#242424]

              lg:text-[17px]
            "
          >
            From red carpet arrival to
            the final dance, here is how
            Graduation Eve unfolds.
          </p>
        </div>

        {/* =====================================================
            DESKTOP TIMELINE
        ====================================================== */}

        <div
          className="
            relative
            mt-16
            hidden

            lg:block
          "
        >
          {/* Main timeline line */}

          <div
            className="
              absolute
              left-[14px]
              right-[28px]
              top-[11px]
              h-[3px]
              bg-black
            "
          />

          {/* Starting square */}

          <div
            className="
              absolute
              left-0
              top-[3px]
              h-[19px]
              w-[19px]
              bg-black
            "
          />

          {/* Ending block */}

          <div
            className="
              absolute
              right-0
              top-0
              flex
              h-[27px]
              w-[30px]
              items-center
              justify-center
              bg-[#ff914d]
            "
          >
            <span
              className="
                block
                translate-x-[1px]
                text-[20px]
                font-normal
                leading-none
                text-white
              "
            >
              ›
            </span>
          </div>

          {/* Timeline items */}

          <div
            className="
              grid
              grid-cols-4
              gap-10
              px-[14px]
            "
          >
            {PROGRAM.map(
              (
                item,
                index
              ) => (
                <article
                  key={
                    item.time
                  }
                  className="
                    relative
                    min-w-0
                  "
                >
                  {/* Timeline point */}

                  <div
                    className="
                      relative
                      h-[33px]
                    "
                  >
                    <span
                      className="
                        absolute
                        left-0
                        top-[4px]
                        h-[15px]
                        w-[15px]
                        rounded-full
                        bg-black
                      "
                    />
                  </div>

                  {/* Time */}

                  <p
                    className="
                      text-[32px]
                      font-medium
                      leading-none
                      tracking-[-0.03em]
                      text-[#252525]
                    "
                  >
                    {item.time}
                  </p>

                  {/* Short underline */}

                  <div
                    className="
                      mt-4
                      h-[2px]
                      w-[64px]
                      bg-black
                    "
                  />

                  {/* Optional till late */}

                  {item.eyebrow && (
                    <p
                      className="
                        mt-6
                        text-[12px]
                        font-medium
                        uppercase
                        tracking-[0.08em]
                        text-[#ff914d]
                      "
                    >
                      {
                        item.eyebrow
                      }
                    </p>
                  )}

                  {/* Title */}

                  <h3
                    className={`
                      text-[16px]
                      font-medium
                      leading-[1.3]
                      text-black

                      ${
                        item.eyebrow
                          ? 'mt-2'
                          : 'mt-6'
                      }
                    `}
                  >
                    {item.title}
                  </h3>

                  {/* Description */}

                  <p
                    className="
                      mt-2
                      max-w-[230px]
                      text-[14px]
                      font-normal
                      leading-[1.55]
                      text-[#242424]
                    "
                  >
                    {
                      item.description
                    }
                  </p>
                </article>
              )
            )}
          </div>
        </div>

        {/* =====================================================
            MOBILE / TABLET VERTICAL TIMELINE
        ====================================================== */}

        <div
          className="
            relative
            mt-12
            pl-9

            lg:hidden
          "
        >
          {/* Vertical line */}

          <div
            className="
              absolute
              bottom-0
              left-[7px]
              top-[4px]
              w-[2px]
              bg-black
            "
          />

          {PROGRAM.map(
            (
              item,
              index
            ) => (
              <article
                key={
                  item.time
                }
                className={`
                  relative

                  ${
                    index ===
                    PROGRAM.length -
                      1
                      ? ''
                      : 'pb-10'
                  }
                `}
              >
                {/* Point */}

                <span
                  className="
                    absolute
                    -left-[38px]
                    top-[5px]
                    h-[16px]
                    w-[16px]
                    rounded-full
                    bg-black
                  "
                />

                <p
                  className="
                    text-[27px]
                    font-medium
                    leading-none
                    tracking-[-0.03em]
                    text-black

                    sm:text-[30px]
                  "
                >
                  {item.time}
                </p>

                <div
                  className="
                    mt-3
                    h-[2px]
                    w-[55px]
                    bg-black
                  "
                />

                {item.eyebrow && (
                  <p
                    className="
                      mt-5
                      text-[11px]
                      font-medium
                      uppercase
                      tracking-[0.08em]
                      text-[#ff914d]
                    "
                  >
                    {
                      item.eyebrow
                    }
                  </p>
                )}

                <h3
                  className={`
                    text-[20px]
                    font-medium
                    leading-[1.25]
                    tracking-[-0.01em]
                    text-black

                    ${
                      item.eyebrow
                        ? 'mt-2'
                        : 'mt-5'
                    }
                  `}
                >
                  {item.title}
                </h3>

                <p
                  className="
                    mt-3
                    max-w-[500px]
                    text-[15px]
                    font-normal
                    leading-[1.6]
                    text-[#242424]
                  "
                >
                  {
                    item.description
                  }
                </p>
              </article>
            )
          )}

          {/* Final orange marker */}

          <div
            className="
              absolute
              -left-[2px]
              bottom-0
              h-[20px]
              w-[20px]
              bg-[#ff914d]
            "
          />
        </div>
      </div>
    </section>
  );
}