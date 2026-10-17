'use client';

import React from 'react';
import {
  Check,
  Share2,
} from 'lucide-react';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80';

const TrendingPodium = ({
  candidates,
  selectedCategory,
  copiedId,
  highlightedId,
  onShare,
  onVote,
}) => {
  return (
    <section
      className="
        mb-14

        lg:mb-16
      "
    >
      {/* =============================================
          HEADING
      ============================================= */}

      <div
        className="
          mb-6
          flex
          items-end
          justify-between
          gap-4
        "
      >
        <div>
          <p
            className="
              text-[12px]
              font-medium
              text-[#762e99]
            "
          >
            Trending now
          </p>

          <h3
            className="
              mt-1
              text-[24px]
              font-normal
              tracking-[-0.02em]
              text-black
            "
          >
            Leading the vote
          </h3>
        </div>

        <p
          className="
            hidden
            text-[13px]
            text-black/50

            sm:block
          "
        >
          {selectedCategory}
        </p>
      </div>

      {/* =============================================
          PODIUM GRID
      ============================================= */}

      <div
        className="
          grid
          grid-cols-1
          gap-4

          md:grid-cols-3
          md:items-end
        "
      >
        {candidates.map(
          (candidate, index) => {
            const rank =
              candidate.rank ||
              index + 1;

            const first =
              rank === 1;

            const isHighlighted = highlightedId === candidate._id;

            return (
              <article
                key={
                  candidate._id
                }
                id={`nominee-${candidate._id}`}
                className={`
                  relative
                  overflow-hidden
                  bg-white
                  transition-all
                  duration-300

                  hover:-translate-y-1

                  ${isHighlighted ? 'ring-2 ring-[#ff914d] ring-offset-2 shadow-xl' : ''}

                  ${
                    first
                      ? `
                        border
                        border-[#762e99]/30

                        md:-translate-y-3
                      `
                      : `
                        border
                        border-black/[0.08]
                      `
                  }
                `}
              >
                {/* =================================
                    IMAGE
                ================================== */}

                <div
                  className={`
                    relative
                    w-full
                    overflow-hidden

                    ${
                      first
                        ? 'h-[300px]'
                        : 'h-[270px]'
                    }
                  `}
                >
                  <img
                    src={
                      candidate.photoUrl ||
                      FALLBACK_IMAGE
                    }
                    alt={
                      candidate.name
                    }
                    className="
                      h-full
                      w-full
                      object-cover
                      object-center
                    "
                  />

                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/55
                      via-transparent
                      to-transparent
                    "
                  />

                  {/* Rank */}

                  <div
                    className="
                      absolute
                      left-4
                      top-4
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-[14px]
                      font-medium
                      text-black
                    "
                  >
                    {rank}
                  </div>

                  {first && (
                    <div
                      className="
                        absolute
                        right-4
                        top-4
                        rounded-full
                        bg-[#ff914d]
                        px-3
                        py-1.5
                        text-[11px]
                        font-medium
                        text-white
                      "
                    >
                      Leading
                    </div>
                  )}
                </div>

                {/* =================================
                    CONTENT
                ================================== */}

                <div className="p-5">
                  <p
                    className="
                      text-[11px]
                      font-medium
                      text-[#762e99]
                    "
                  >
                    {candidate.category}
                  </p>

                  <h4
                    className="
                      mt-1
                      text-[20px]
                      font-medium
                      tracking-[-0.02em]
                      text-black
                    "
                  >
                    {candidate.name}
                  </h4>

                  {candidate.oneLiner && (
                    <p
                      className="
                        mt-2
                        line-clamp-2
                        text-[13px]
                        leading-[1.55]
                        text-black/55
                      "
                    >
                      {candidate.oneLiner}
                    </p>
                  )}

                  {/* Votes */}

                  <div
                    className="
                      mt-5
                      flex
                      items-end
                      justify-between
                      gap-3
                      border-t
                      border-black/[0.07]
                      pt-4
                    "
                  >
                    <div>
                      <p
                        className="
                          text-[11px]
                          text-black/40
                        "
                      >
                        Votes
                      </p>

                      <p
                        className="
                          mt-1
                          text-[22px]
                          font-medium
                          tracking-[-0.02em]
                          text-black
                        "
                      >
                        {(
                          candidate.voteCount ||
                          0
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onShare(
                            candidate
                          )
                        }
                        title="Copy candidate link"
                        className="
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-black/10
                          text-black/60
                          transition-all

                          hover:border-[#ff914d]
                          hover:text-[#ff914d]
                        "
                      >
                        {copiedId ===
                        candidate._id ? (
                          <Check
                            className="
                              h-4
                              w-4
                            "
                          />
                        ) : (
                          <Share2
                            className="
                              h-4
                              w-4
                            "
                          />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onVote(
                            candidate
                          )
                        }
                        className="
                          rounded-full
                          bg-gradient-to-r
                          from-[#5e2590]
                          to-[#762e99]
                          px-5
                          py-2.5
                          text-[13px]
                          font-medium
                          text-white
                          transition-all

                          hover:opacity-90

                          active:scale-[0.98]
                        "
                      >
                        Vote
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          }
        )}
      </div>
    </section>
  );
};

export default TrendingPodium;