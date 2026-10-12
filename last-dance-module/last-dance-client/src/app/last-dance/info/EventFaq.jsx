'use client';

import React, {
  useState,
} from 'react';

const FAQS = [
  {
    question:
      'How does voting work?',

    answer:
      'Voting is completed through M-Pesa STK Push. You can vote for candidates across the available award categories, and updated vote totals are reflected on the leaderboard.',
  },

  {
    question:
      'How do I receive my event entry pass?',

    answer:
      'After a successful M-Pesa ticket payment, your unique digital QR entry pass is generated and delivered to the email address provided during checkout.',
  },

  {
    question:
      'Can I nominate someone else?',

    answer:
      'Yes. You can nominate yourself, a friend, duo or eligible campus group through the nomination page. Nominations are free and appear after review.',
  },

  {
    question:
      'What is the dress code?',

    answer:
      'The dress code is red carpet and elegant eveningwear. Come ready for the gala, photography and the full Graduation Eve experience.',
  },
];

export default function EventFaq() {
  const [
    openFaq,
    setOpenFaq,
  ] = useState(0);

  return (
    <section
      className="
        bg-[#f7f7f7]
        py-20

        sm:py-24

        lg:py-28
      "
      style={{
        fontFamily:
          'Roboto, sans-serif',
      }}
    >
      <div
        className="
          mx-auto
          w-full
          max-w-[900px]
          px-4

          sm:px-6
        "
      >
        {/* =====================================================
            HEADING
        ====================================================== */}

        <div
          className="
            max-w-[700px]
          "
        >
          <p
            className="
              text-[13px]
              font-medium
              text-[#ff914d]
            "
          >
            Need to know
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
            Frequently asked questions
          </h2>

          <p
            className="
              mt-5
              max-w-[600px]
              text-[16px]
              font-normal
              leading-[1.65]
              text-[#242424]
            "
          >
            Quick answers about voting,
            tickets, nominations and the
            Graduation Eve experience.
          </p>
        </div>

        {/* =====================================================
            ACCORDION
        ====================================================== */}

        <div
          className="
            mt-12
            border-t
            border-black/10
          "
        >
          {FAQS.map(
            (
              faq,
              index
            ) => {
              const isOpen =
                openFaq ===
                index;

              return (
                <div
                  key={
                    faq.question
                  }
                  className="
                    border-b
                    border-black/10
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(
                        isOpen
                          ? null
                          : index
                      )
                    }
                    aria-expanded={
                      isOpen
                    }
                    className="
                      flex
                      w-full
                      items-center
                      justify-between
                      gap-6
                      py-6
                      text-left

                      sm:py-7
                    "
                  >
                    <span
                      className="
                        text-[16px]
                        font-medium
                        leading-[1.35]
                        text-black

                        sm:text-[18px]
                      "
                    >
                      {
                        faq.question
                      }
                    </span>

                    <span
                      className={`
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        text-[20px]
                        font-normal
                        transition-all
                        duration-200

                        ${
                          isOpen
                            ? `
                              border-[#762e99]
                              bg-[#762e99]
                              text-white
                            `
                            : `
                              border-black/15
                              bg-white
                              text-black
                            `
                        }
                      `}
                    >
                      {isOpen
                        ? '−'
                        : '+'}
                    </span>
                  </button>

                  <div
                    className={`
                      grid
                      transition-all
                      duration-300
                      ease-out

                      ${
                        isOpen
                          ? `
                            grid-rows-[1fr]
                            opacity-100
                          `
                          : `
                            grid-rows-[0fr]
                            opacity-0
                          `
                      }
                    `}
                  >
                    <div
                      className="
                        overflow-hidden
                      "
                    >
                      <p
                        className="
                          max-w-[720px]
                          pb-7
                          pr-10
                          text-[15px]
                          font-normal
                          leading-[1.7]
                          text-[#242424]

                          sm:text-[16px]
                        "
                      >
                        {
                          faq.answer
                        }
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}