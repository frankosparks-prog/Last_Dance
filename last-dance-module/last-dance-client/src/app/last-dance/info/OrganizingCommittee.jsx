'use client';

import React from 'react';

/* =========================================================
   ORGANIZING COMMITTEE DATA

   Add another object to this array and it will
   automatically render another team member card.
========================================================= */

const COMMITTEE_MEMBERS = [
  {
    id: 1,

    name: 'Maxwel Ndungu',

    role: 'Event Chairperson',

    title:
      'Overall coordination & leadership',

    image:
      'https://ik.imagekit.io/rhjfaafsm/Lastdancedefaultprofile.svg',
  },

  {
    id: 2,

    name: 'Joe Njoroge',

    role: 'Creative Director',

    title:
      'Visual direction & guest experience',

    image:
      'https://ik.imagekit.io/rhjfaafsm/Lastdancedefaultprofile.svg',
  },

  {
    id: 3,

    name: 'Frank Maina',

    role: 'Operations Lead',

    title:
      'Logistics, venue & event flow',

    image:
      'https://ik.imagekit.io/rhjfaafsm/Lastdancedefaultprofile.svg',
  },

  {
    id: 4,

    name: 'Isaac njuguna',

    role: 'Events MC & Awards Lead',

    title:
      'Nominations, voting & awards management',

    image:
      'https://ik.imagekit.io/rhjfaafsm/Lastdancedefaultprofile.svg',
  },

//   {
//     id: 5,

//     name: 'Kevin Mwangi',

//     role: 'Entertainment Lead',

//     title:
//       'Music, performances & afterparty',

//     image:
//       'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=900&q=90',
//   },
];

/* =========================================================
   PROFILE CARD
========================================================= */

function CommitteeCard({
  member,
}) {
  return (
    <article
      className="
        group
        overflow-hidden
        bg-white
        transition-all
        duration-300

        hover:-translate-y-1
        hover:shadow-[0_18px_45px_rgba(0,0,0,0.08)]
      "
    >
      {/* =====================================================
          MEMBER PHOTO
      ====================================================== */}

      <div
        className="
          relative
          aspect-[4/5]
          w-full
          overflow-hidden
          bg-[#eeeeee]
        "
      >
        <img
          src={member.image}
          alt={member.name}
          loading="lazy"
          className="
            h-full
            w-full
            object-cover
            object-top
            transition-transform
            duration-700
            ease-out

            group-hover:scale-[1.025]
          "
        />

        {/* Role label */}

        <div
          className="
            absolute
            left-4
            top-4
          "
        >
          <span
            className="
              inline-flex
              bg-white/95
              px-3
              py-1.5
              text-[11px]
              font-medium
              text-[#762e99]
              backdrop-blur-sm
            "
          >
            {member.role}
          </span>
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          px-5
          pb-6
          pt-5

          sm:px-6
          sm:pb-7
          sm:pt-6
        "
      >
        <h3
          className="
            text-[22px]
            font-medium
            leading-[1.2]
            tracking-[-0.02em]
            text-black

            sm:text-[24px]
          "
        >
          {member.name}
        </h3>

        <p
          className="
            mt-2
            text-[14px]
            font-normal
            leading-[1.6]
            text-[#242424]/65
          "
        >
          {member.title}
        </p>

        {/* Small brand line */}

        <div
          className="
            mt-5
            h-[2px]
            w-[42px]
            bg-[#ff914d]
          "
        />
      </div>
    </article>
  );
}

/* =========================================================
   ORGANIZING COMMITTEE SECTION
========================================================= */

export default function OrganizingCommittee() {
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
          max-w-[1180px]
          px-4

          sm:px-6

          lg:px-4
        "
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div
          className="
            mb-12
            max-w-[720px]

            sm:mb-14

            lg:mb-16
          "
        >
          <p
            className="
              text-[13px]
              font-medium
              text-[#ff914d]
            "
          >
            Behind the Last Dance
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
            Meet the organizing committee
          </h2>

          <p
            className="
              mt-5
              max-w-[620px]
              text-[16px]
              font-normal
              leading-[1.65]
              text-[#242424]

              lg:text-[17px]
            "
          >
            The team working behind the scenes to bring together the
            Last Dance Graduation Eve experience, from planning and
            production to awards, entertainment and event operations.
          </p>
        </div>

        {/* =====================================================
            TEAM GRID

            Add another member to COMMITTEE_MEMBERS and
            another card will render automatically.
        ====================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-6

            sm:grid-cols-2
            sm:gap-7

            lg:grid-cols-3
            lg:gap-8
          "
        >
          {COMMITTEE_MEMBERS.map(
            (member) => (
              <CommitteeCard
                key={member.id}
                member={member}
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}