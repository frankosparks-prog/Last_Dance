'use client';

import React from 'react';
import Link from 'next/link';

import {
  Check,
  Share2,
} from 'lucide-react';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80';

const CandidatesGrid = ({
  loading,
  candidates,
  selectedCategory,
  rankOffset,
  copiedId,
  onShare,
  onVote,
}) => {
  const sectionTitle =
    selectedCategory === 'All'
      ? 'All nominees'
      : `${selectedCategory} nominees`;

  return (
    <section>
      {/* =============================================
          HEADING
      ============================================= */}

      <div className="mb-6">
        <p
          className="
            text-[12px]
            font-medium
            text-[#762e99]
          "
        >
          Explore candidates
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
          {sectionTitle}
        </h3>
      </div>

      {/* =============================================
          LOADING
      ============================================= */}

      {loading && (
        <div
          className="
            grid
            grid-cols-1
            gap-4

            sm:grid-cols-2

            lg:grid-cols-3
          "
        >
          {[1, 2, 3, 4, 5, 6].map(
            (item) => (
              <div
                key={item}
                className="
                  h-[340px]
                  animate-pulse
                  bg-white
                "
              />
            )
          )}
        </div>
      )}

      {/* =============================================
          EMPTY STATE
      ============================================= */}

      {!loading &&
        candidates.length === 0 && (
          <div
            className="
              border
              border-black/[0.08]
              bg-white
              px-6
              py-16
              text-center
            "
          >
            <h4
              className="
                text-[20px]
                font-medium
                text-black
              "
            >
              No nominees found
            </h4>

            <p
              className="
                mx-auto
                mt-2
                max-w-[420px]
                text-[14px]
                leading-[1.6]
                text-black/55
              "
            >
              We couldn't find a
              candidate matching this
              category or search.
            </p>

            <Link
              href="/last-dance/register"
              className="
                mt-6
                inline-flex
                rounded-full
                bg-[#5e2590]
                px-6
                py-3
                text-[14px]
                font-medium
                text-white
                transition-colors

                hover:bg-[#762e99]
              "
            >
              Nominate a candidate
            </Link>
          </div>
        )}

      {/* =============================================
          CANDIDATES
      ============================================= */}

      {!loading &&
        candidates.length > 0 && (
          <div
            className="
              grid
              grid-cols-1
              gap-4

              sm:grid-cols-2

              lg:grid-cols-3
            "
          >
            {candidates.map(
              (
                candidate,
                index
              ) => {
                const rank =
                  candidate.rank ||
                  rankOffset +
                    index;

                return (
                  <article
                    key={
                      candidate._id
                    }
                    className="
                      group
                      overflow-hidden
                      border
                      border-black/[0.08]
                      bg-white
                      transition-all
                      duration-300

                      hover:-translate-y-1
                      hover:shadow-[0_16px_35px_rgba(0,0,0,0.06)]
                    "
                  >
                    {/* Image */}

                    <div
                      className="
                        relative
                        h-[230px]
                        overflow-hidden
                      "
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
                          transition-transform
                          duration-500

                          group-hover:scale-[1.03]
                        "
                      />

                      <div
                        className="
                          absolute
                          left-4
                          top-4
                          rounded-full
                          bg-white
                          px-3
                          py-1.5
                          text-[12px]
                          font-medium
                          text-black
                        "
                      >
                        #{rank}
                      </div>
                    </div>

                    {/* Content */}

                    <div className="p-5">
                      <p
                        className="
                          text-[11px]
                          font-medium
                          text-[#762e99]
                        "
                      >
                        {
                          candidate.category
                        }
                      </p>

                      <h4
                        className="
                          mt-1
                          text-[18px]
                          font-medium
                          tracking-[-0.01em]
                          text-black
                        "
                      >
                        {
                          candidate.name
                        }
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
                          {
                            candidate.oneLiner
                          }
                        </p>
                      )}

                      {/* Bottom */}

                      <div
                        className="
                          mt-5
                          flex
                          items-center
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
                              text-[10px]
                              text-black/40
                            "
                          >
                            Votes
                          </p>

                          <p
                            className="
                              mt-0.5
                              text-[16px]
                              font-medium
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
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-full
                              border
                              border-black/10
                              text-black/55
                              transition-all

                              hover:border-[#ff914d]
                              hover:text-[#ff914d]
                            "
                          >
                            {copiedId ===
                            candidate._id ? (
                              <Check
                                className="
                                  h-3.5
                                  w-3.5
                                "
                              />
                            ) : (
                              <Share2
                                className="
                                  h-3.5
                                  w-3.5
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
                              bg-[#5e2590]
                              px-4
                              py-2
                              text-[12px]
                              font-medium
                              text-white
                              transition-colors

                              hover:bg-[#762e99]
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
        )}
    </section>
  );
};

export default CandidatesGrid;