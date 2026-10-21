// 'use client';

// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
// } from 'react';

// import axios from 'axios';
// import io from 'socket.io-client';

// import VoteModal from '../VoteModal';

// import LeaderboardToolbar from './LeaderboardToolbar';
// import TrendingPodium from './TrendingPodium';
// import CandidatesGrid from './CandidatesGrid';

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL ||
//   'http://localhost:5000/api';

// const SOCKET_URL =
//   process.env.NEXT_PUBLIC_SOCKET_URL ||
//   'http://localhost:5000';

// const DEFAULT_CATEGORIES = [
//   'Mr & Miss Last Dance',
//   'Most Likely to Succeed',
//   'Best Dressed / Most Stylish',
//   'Life of the Party',
//   'Power Couple',
//   'Campus Icon',
//   'Comeback King/Queen',
//   'Squad of the Year',
//   'Most Missed',
// ];

// const LeaderboardExperience = () => {
//   const [candidates, setCandidates] = useState([]);
//   const [categories, setCategories] = useState([]);

//   const [selectedCategory, setSelectedCategory] =
//     useState('All');

//   const [searchQuery, setSearchQuery] =
//     useState('');

//   const [loading, setLoading] =
//     useState(true);

//   const [votingCandidate, setVotingCandidate] =
//     useState(null);

//   const [copiedId, setCopiedId] =
//     useState(null);

//   // =============================================
//   // FETCH CANDIDATES
//   // =============================================

//   const fetchCandidates = useCallback(async () => {
//     setLoading(true);

//     try {
//       const response = await axios.get(
//         `${API_BASE_URL}/last-dance/candidates`,
//         {
//           params: {
//             category: selectedCategory,
//           },
//         }
//       );

//       if (response.data?.success) {
//         setCandidates(
//           response.data.candidates || []
//         );

//         if (response.data.categories) {
//           setCategories(
//             response.data.categories
//           );
//         }
//       }
//     } catch (error) {
//       console.error(
//         'Failed to fetch candidates:',
//         error
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedCategory]);

//   // =============================================
//   // FETCH WHEN CATEGORY CHANGES
//   // =============================================

//   useEffect(() => {
//     fetchCandidates();
//   }, [fetchCandidates]);

//   // =============================================
//   // SOCKET.IO REAL-TIME VOTING
//   // =============================================

//   useEffect(() => {
//     const socket = io(SOCKET_URL, {
//       transports: [
//         'websocket',
//         'polling',
//       ],
//     });

//     socket.on(
//       'last_dance:vote_updated',
//       (data) => {
//         setCandidates((previous) => {
//           const updated =
//             previous.map(
//               (candidate) => {
//                 if (
//                   candidate._id ===
//                   data.candidateId
//                 ) {
//                   return {
//                     ...candidate,
//                     voteCount:
//                       data.newVoteCount,
//                   };
//                 }

//                 return candidate;
//               }
//             );

//           return updated.sort(
//             (a, b) =>
//               (b.voteCount || 0) -
//               (a.voteCount || 0)
//           );
//         });
//       }
//     );

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   // =============================================
//   // SHARE CANDIDATE
//   // =============================================

//   const handleShareCandidate =
//     async (candidate) => {
//       if (
//         typeof window ===
//         'undefined'
//       ) {
//         return;
//       }

//       const shareUrl =
//         `${
//           window.location.origin
//         }/last-dance?category=${encodeURIComponent(
//           candidate.category || ''
//         )}`;

//       try {
//         await navigator.clipboard.writeText(
//           shareUrl
//         );

//         setCopiedId(candidate._id);

//         setTimeout(() => {
//           setCopiedId(null);
//         }, 2500);
//       } catch (error) {
//         console.error(
//           'Unable to copy candidate link:',
//           error
//         );
//       }
//     };

//   // =============================================
//   // SEARCH
//   // =============================================

//   const filteredCandidates =
//     useMemo(() => {
//       const query =
//         searchQuery
//           .trim()
//           .toLowerCase();

//       if (!query) {
//         return candidates;
//       }

//       return candidates.filter(
//         (candidate) => {
//           const name =
//             candidate.name || '';

//           const oneLiner =
//             candidate.oneLiner || '';

//           const category =
//             candidate.category || '';

//           return (
//             name
//               .toLowerCase()
//               .includes(query) ||
//             oneLiner
//               .toLowerCase()
//               .includes(query) ||
//             category
//               .toLowerCase()
//               .includes(query)
//           );
//         }
//       );
//     }, [
//       candidates,
//       searchQuery,
//     ]);

//   // =============================================
//   // LEADERBOARD DATA
//   // =============================================

//   const top3 =
//     filteredCandidates.slice(0, 3);

//   const remainingCandidates =
//     filteredCandidates.slice(3);

//   const totalVotesInView =
//     filteredCandidates.reduce(
//       (total, candidate) =>
//         total +
//         (candidate.voteCount || 0),
//       0
//     );

//   const visibleCategories = [
//     'All',
//     ...(
//       categories.length > 0
//         ? categories
//         : DEFAULT_CATEGORIES
//     ),
//   ];

//   // =============================================
//   // UI
//   // =============================================

//   return (
//     <>
//       <section
//         id="leaderboard"
//         className="
//           w-full
//           bg-[#f7f7f7]
//           py-12

//           sm:py-14

//           lg:py-16
//         "
//         style={{
//           fontFamily:
//             'Roboto, sans-serif',
//         }}
//       >
//         <div
//           className="
//             mx-auto
//             w-full
//             max-w-[1180px]
//             px-4

//             sm:px-6

//             lg:px-4
//           "
//         >
//           {/* =========================================
//               SECTION INTRO
//           ========================================== */}

//           <div
//             className="
//               mb-8
//               max-w-[720px]

//               lg:mb-10
//             "
//           >
//             <p
//               className="
//                 text-[13px]
//                 font-medium
//                 text-[#762e99]
//               "
//             >
//               Live voting
//             </p>

//             <h2
//               className="
//                 mt-2
//                 text-[28px]
//                 font-normal
//                 leading-[1.15]
//                 tracking-[-0.02em]
//                 text-black

//                 sm:text-[32px]

//                 lg:text-[36px]
//               "
//             >
//               Who is leading the Last
//               Dance?
//             </h2>

//             <p
//               className="
//                 mt-3
//                 max-w-[620px]
//                 text-[14px]
//                 leading-[1.6]
//                 text-black/60

//                 sm:text-[15px]
//               "
//             >
//               Explore nominees, filter
//               by category and vote for
//               the candidates you want
//               to see win.
//             </p>
//           </div>

//           {/* =========================================
//               SEARCH + FILTERS
//           ========================================== */}

//           <LeaderboardToolbar
//             searchQuery={
//               searchQuery
//             }
//             onSearchChange={
//               setSearchQuery
//             }
//             selectedCategory={
//               selectedCategory
//             }
//             onCategoryChange={
//               setSelectedCategory
//             }
//             categories={
//               visibleCategories
//             }
//             candidateCount={
//               filteredCandidates.length
//             }
//             totalVotes={
//               totalVotesInView
//             }
//             loading={loading}
//             onRefresh={
//               fetchCandidates
//             }
//           />

//           {/* =========================================
//               PODIUM
//           ========================================== */}

//           {!loading &&
//             top3.length > 0 && (
//               <TrendingPodium
//                 candidates={
//                   top3
//                 }
//                 selectedCategory={
//                   selectedCategory
//                 }
//                 copiedId={
//                   copiedId
//                 }
//                 onShare={
//                   handleShareCandidate
//                 }
//                 onVote={
//                   setVotingCandidate
//                 }
//               />
//             )}

//           {/* =========================================
//               ALL OTHER CANDIDATES
//           ========================================== */}

//           <CandidatesGrid
//             loading={loading}
//             candidates={
//               top3.length > 0
//                 ? remainingCandidates
//                 : filteredCandidates
//             }
//             selectedCategory={
//               selectedCategory
//             }
//             rankOffset={
//               top3.length > 0
//                 ? 4
//                 : 1
//             }
//             copiedId={
//               copiedId
//             }
//             onShare={
//               handleShareCandidate
//             }
//             onVote={
//               setVotingCandidate
//             }
//           />
//         </div>
//       </section>

//       {/* =============================================
//           VOTE MODAL
//       ============================================= */}

//       {votingCandidate && (
//         <VoteModal
//           candidate={
//             votingCandidate
//           }
//           onClose={() =>
//             setVotingCandidate(
//               null
//             )
//           }
//           onSuccess={
//             fetchCandidates
//           }
//         />
//       )}
//     </>
//   );
// };

// export default LeaderboardExperience;







'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import axios from 'axios';
import io from 'socket.io-client';

import VoteModal from '@/components/last-dance/VoteModal';
import LeaderboardToolbar from './LeaderboardToolbar';
import TrendingPodium from './TrendingPodium';
import CandidatesGrid from './CandidatesGrid';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://lastdance.co.ke/api';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  'https://lastdance.co.ke';

const SOCKET_PATH =
  process.env.NEXT_PUBLIC_SOCKET_PATH ||
  '/api/socket.io';

const DEFAULT_CATEGORIES = [
  'Mr & Miss Last Dance',
  'Most Likely to Succeed',
  'Best Dressed / Most Stylish',
  'Life of the Party',
  'Power Couple',
  'Campus Icon',
  'Comeback King/Queen',
  'Squad of the Year',
  'Most Missed',
];

export default function LeaderboardExperience() {
  const [candidates, setCandidates] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] =
    useState('All');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [votingCandidate, setVotingCandidate] =
    useState(null);

  const [copiedId, setCopiedId] =
    useState(null);

  const [highlightedNomineeId, setHighlightedNomineeId] =
    useState(null);

  // =============================================
  // SYNC FROM URL QUERY PARAMS (?category=... & ?nominee=...)
  // =============================================

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get('category');
    const nomineeFromUrl = urlParams.get('nominee');
    const hashNominee = window.location.hash?.replace('#nominee-', '');

    if (categoryFromUrl && categoryFromUrl.trim()) {
      setSelectedCategory(categoryFromUrl.trim());
    }

    const targetNomineeId = nomineeFromUrl || hashNominee;
    if (targetNomineeId) {
      setHighlightedNomineeId(targetNomineeId);
    }
  }, []);

  // =============================================
  // FETCH CANDIDATES
  // =============================================

  const fetchCandidates = useCallback(async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/last-dance/candidates`,
        {
          params: {
            category: selectedCategory,
          },
        }
      );

      if (response.data?.success) {
        setCandidates(
          Array.isArray(response.data.candidates)
            ? response.data.candidates
            : []
        );

        if (
          Array.isArray(response.data.categories)
        ) {
          setCategories(
            response.data.categories
          );
        }
      }
    } catch (error) {
      console.error(
        'Failed to fetch candidates:',
        error
      );
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  // =============================================
  // FETCH WHEN CATEGORY CHANGES
  // =============================================

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // =============================================
  // SOCKET.IO LIVE VOTE UPDATES
  // =============================================

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      path: SOCKET_PATH,
      transports: [
        'websocket',
        'polling',
      ],
    });

    socket.on('connect', () => {
      console.log('[Leaderboard] Connected to real-time socket:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Leaderboard] Socket connection warning:', err.message);
    });

    const handleVoteUpdated = (data) => {
      if (
        !data ||
        !data.candidateId
      ) {
        return;
      }

      console.log('[Leaderboard] Real-time vote increment event:', data);

      setCandidates((previousCandidates) => {
        let matched = false;
        const updatedCandidates =
          previousCandidates.map(
            (candidate) => {
              if (
                String(candidate._id) ===
                String(data.candidateId)
              ) {
                matched = true;
                const nextVoteCount = data.newVoteCount !== undefined
                  ? Number(data.newVoteCount)
                  : ((Number(candidate.voteCount) || 0) + (Number(data.votesAdded) || 0));

                return {
                  ...candidate,
                  voteCount: nextVoteCount,
                };
              }

              return candidate;
            }
          );

        // If candidate not in current list (e.g. filtered view), re-fetch to ensure fresh data
        if (!matched && fetchCandidates) {
          fetchCandidates();
        }

        return updatedCandidates.sort(
          (a, b) =>
            (Number(b.voteCount) || 0) -
            (Number(a.voteCount) || 0)
        );
      });
    };

    const handleCategoriesUpdated = (data) => {
      if (data?.categories && Array.isArray(data.categories)) {
        console.log('[Leaderboard] Real-time categories update received:', data.categories);
        setCategories(data.categories);

        // If current selectedCategory was renamed, migrate active tab selection
        if (data.migrated && data.migrated.oldName && data.migrated.newName) {
          setSelectedCategory((prev) => (prev === data.migrated.oldName ? data.migrated.newName : prev));
        } else {
          // If current selected category was deleted, fallback to 'All'
          setSelectedCategory((prev) => {
            if (prev !== 'All' && !data.categories.includes(prev)) {
              return 'All';
            }
            return prev;
          });
        }

        if (fetchCandidates) {
          fetchCandidates();
        }
      }
    };

    const handleCandidatesUpdated = () => {
      console.log('[Leaderboard] Real-time candidates update received');
      if (fetchCandidates) {
        fetchCandidates();
      }
    };

    socket.on(
      'last_dance:vote_updated',
      handleVoteUpdated
    );

    socket.on(
      'last_dance:categories_updated',
      handleCategoriesUpdated
    );

    socket.on(
      'last_dance:candidates_updated',
      handleCandidatesUpdated
    );

    return () => {
      socket.off(
        'last_dance:vote_updated',
        handleVoteUpdated
      );

      socket.off(
        'last_dance:categories_updated',
        handleCategoriesUpdated
      );

      socket.off(
        'last_dance:candidates_updated',
        handleCandidatesUpdated
      );

      socket.disconnect();
    };
  }, [fetchCandidates]);

  // =============================================
  // AUTO-SCROLL TO NOMINEE WHEN LINK HAS NOMINEE ID
  // =============================================

  useEffect(() => {
    if (!highlightedNomineeId || loading || candidates.length === 0) return;

    const timer = setTimeout(() => {
      const el = document.getElementById(`nominee-${highlightedNomineeId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 400);

    const clearTimer = setTimeout(() => {
      setHighlightedNomineeId(null);
    }, 4500);

    return () => {
      clearTimeout(timer);
      clearTimeout(clearTimer);
    };
  }, [highlightedNomineeId, loading, candidates]);

  // =============================================
  // SHARE CANDIDATE
  // =============================================

  const handleShareCandidate =
    async (candidate) => {
      if (
        typeof window ===
        'undefined' || !candidate
      ) {
        return;
      }

      const categoryParam = encodeURIComponent(candidate.category || '');
      const nomineeParam = encodeURIComponent(candidate._id || '');
      const shareUrl = `${window.location.origin}/last-dance?category=${categoryParam}&nominee=${nomineeParam}#nominee-${candidate._id}`;

      const shareData = {
        title: `Vote for ${candidate.name} - Last Dance 2026`,
        text: `Vote for ${candidate.name} in category "${candidate.category}" on the Last Dance Awards leaderboard!`,
        url: shareUrl,
      };

      if (
        typeof navigator !== 'undefined' &&
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        try {
          await navigator.share(shareData);
          setCopiedId(candidate._id);
          window.setTimeout(() => setCopiedId(null), 2500);
          return;
        } catch (err) {
          if (err.name === 'AbortError') return;
        }
      }

      try {
        await navigator.clipboard.writeText(
          shareUrl
        );

        setCopiedId(candidate._id);

        window.setTimeout(() => {
          setCopiedId(null);
        }, 2500);
      } catch (error) {
        console.error(
          'Unable to copy candidate link:',
          error
        );
      }
    };

  // =============================================
  // SEARCH
  // =============================================

  const filteredCandidates =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      if (!query) {
        return candidates;
      }

      return candidates.filter(
        (candidate) => {
          const name =
            candidate?.name || '';

          const oneLiner =
            candidate?.oneLiner || '';

          const category =
            candidate?.category || '';

          return (
            name
              .toLowerCase()
              .includes(query) ||
            oneLiner
              .toLowerCase()
              .includes(query) ||
            category
              .toLowerCase()
              .includes(query)
          );
        }
      );
    }, [
      candidates,
      searchQuery,
    ]);

  // =============================================
  // LEADERBOARD DATA
  // =============================================

  const top3 =
    filteredCandidates.slice(0, 3);

  const remainingCandidates =
    filteredCandidates.slice(3);

  const totalVotesInView =
    filteredCandidates.reduce(
      (total, candidate) =>
        total +
        Number(
          candidate?.voteCount || 0
        ),
      0
    );

  const visibleCategories =
    useMemo(() => {
      const categorySource =
        categories.length > 0
          ? categories
          : DEFAULT_CATEGORIES;

      return [
        'All',
        ...Array.from(
          new Set(categorySource)
        ).filter(
          (category) =>
            category &&
            category !== 'All'
        ),
      ];
    }, [categories]);

  // =============================================
  // UI
  // =============================================

  return (
    <>
      <section
        id="leaderboard"
        className="
          w-full
          bg-[#f7f7f7]
          py-12

          sm:py-14

          lg:py-16
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
            max-w-[1180px]
            px-4

            sm:px-6

            lg:px-4
          "
        >
          {/* =========================================
              SECTION INTRO
          ========================================== */}

          <div
            className="
              mb-8
              max-w-[720px]

              lg:mb-10
            "
          >
            <p
              className="
                text-[13px]
                font-medium
                text-[#762e99]
              "
            >
              Live voting
            </p>

            <h2
              className="
                mt-2
                text-[28px]
                font-normal
                leading-[1.15]
                tracking-[-0.02em]
                text-black

                sm:text-[32px]

                lg:text-[36px]
              "
            >
              Who is leading the Last Dance?
            </h2>

            <p
              className="
                mt-3
                max-w-[620px]
                text-[14px]
                leading-[1.6]
                text-black/60

                sm:text-[15px]
              "
            >
              Explore nominees, filter by category
              and vote for the candidates you want
              to see win.
            </p>
          </div>

          {/* =========================================
              SEARCH + FILTERS
          ========================================== */}

          <LeaderboardToolbar
            searchQuery={
              searchQuery
            }
            onSearchChange={
              setSearchQuery
            }
            selectedCategory={
              selectedCategory
            }
            onCategoryChange={
              setSelectedCategory
            }
            categories={
              visibleCategories
            }
            candidateCount={
              filteredCandidates.length
            }
            totalVotes={
              totalVotesInView
            }
            loading={
              loading
            }
            onRefresh={
              fetchCandidates
            }
          />

          {/* =========================================
              TOP 3 PODIUM
          ========================================== */}

          {!loading &&
            top3.length > 0 && (
              <TrendingPodium
                candidates={
                  top3
                }
                selectedCategory={
                  selectedCategory
                }
                copiedId={
                  copiedId
                }
                highlightedId={
                  highlightedNomineeId
                }
                onShare={
                  handleShareCandidate
                }
                onVote={
                  setVotingCandidate
                }
              />
            )}

          {/* =========================================
              REMAINING CANDIDATES
          ========================================== */}

          <CandidatesGrid
            loading={
              loading
            }
            candidates={
              top3.length > 0
                ? remainingCandidates
                : filteredCandidates
            }
            selectedCategory={
              selectedCategory
            }
            rankOffset={
              top3.length > 0
                ? 4
                : 1
            }
            copiedId={
              copiedId
            }
            highlightedId={
              highlightedNomineeId
            }
            onShare={
              handleShareCandidate
            }
            onVote={
              setVotingCandidate
            }
          />
        </div>
      </section>

      {/* =============================================
          VOTE MODAL
      ============================================= */}

      {votingCandidate && (
        <VoteModal
          candidate={
            votingCandidate
          }
          onClose={() => {
            setVotingCandidate(null);
          }}
          onSuccess={
            fetchCandidates
          }
        />
      )}
    </>
  );
}
