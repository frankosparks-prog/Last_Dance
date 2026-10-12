'use client';

import React from 'react';
import {
  RefreshCw,
  Search,
} from 'lucide-react';

const LeaderboardToolbar = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  candidateCount,
  totalVotes,
  loading,
  onRefresh,
}) => {
  return (
    <div className="mb-12">
      {/* =============================================
          SEARCH ROW
      ============================================= */}

      <div
        className="
          flex
          flex-col
          gap-4
          border-y
          border-black/[0.08]
          py-5

          md:flex-row
          md:items-center
          md:justify-between
        "
      >
        {/* Search */}

        <div
          className="
            relative
            w-full

            md:max-w-[430px]
          "
        >
          <Search
            className="
              absolute
              left-0
              top-1/2
              h-[18px]
              w-[18px]
              -translate-y-1/2
              text-black/40
            "
            strokeWidth={1.7}
          />

          <input
            type="text"
            value={searchQuery}
            onChange={(event) =>
              onSearchChange(
                event.target.value
              )
            }
            placeholder="Search candidates"
            className="
              w-full
              border-0
              border-b
              border-black/20
              bg-transparent
              py-3
              pl-7
              pr-3
              text-[14px]
              text-black
              outline-none
              transition-colors

              placeholder:text-black/40

              focus:border-[#762e99]
            "
          />
        </div>

        {/* Counts */}

        <div
          className="
            flex
            items-center
            gap-5
          "
        >
          <div
            className="
              text-[13px]
              text-black/55
            "
          >
            <span
              className="
                font-medium
                text-black
              "
            >
              {candidateCount}
            </span>{' '}
            nominees
          </div>

          <div
            className="
              h-4
              w-px
              bg-black/15
            "
          />

          <div
            className="
              text-[13px]
              text-black/55
            "
          >
            <span
              className="
                font-medium
                text-black
              "
            >
              {totalVotes.toLocaleString()}
            </span>{' '}
            votes
          </div>

          <button
            type="button"
            onClick={onRefresh}
            aria-label="Refresh leaderboard"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-black/10
              bg-white
              text-black/60
              transition-all

              hover:border-[#ff914d]
              hover:text-[#ff914d]
            "
          >
            <RefreshCw
              className={`
                h-4
                w-4

                ${
                  loading
                    ? 'animate-spin'
                    : ''
                }
              `}
              strokeWidth={1.8}
            />
          </button>
        </div>
      </div>

      {/* =============================================
          CATEGORY FILTER
      ============================================= */}

      <div
        className="
          mt-5
          flex
          gap-2
          overflow-x-auto
          pb-2
          scrollbar-none
        "
      >
        {categories.map(
          (category) => {
            const isActive =
              selectedCategory ===
              category;

            return (
              <button
                type="button"
                key={category}
                onClick={() =>
                  onCategoryChange(
                    category
                  )
                }
                className={`
                  shrink-0
                  rounded-full
                  border
                  px-4
                  py-2
                  text-[13px]
                  font-medium
                  transition-all
                  duration-200

                  ${
                    isActive
                      ? `
                        border-[#5e2590]
                        bg-[#5e2590]
                        text-white
                      `
                      : `
                        border-black/10
                        bg-white
                        text-black/70

                        hover:border-[#ff914d]
                        hover:text-[#ff914d]
                      `
                  }
                `}
              >
                {category}
              </button>
            );
          }
        )}
      </div>
    </div>
  );
};

export default LeaderboardToolbar;