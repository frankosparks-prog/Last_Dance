import Link from 'next/link';

const HERO_VIDEO =
  'https://www.chariotgroup.com/wp-content/uploads/2024/07/coverr-audience-5684-1080p.mp4';

const HERO_POSTER =
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=2000&q=90';

const LastDanceHero = () => {
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
        fontFamily: 'Roboto, sans-serif',
      }}
    >
      {/* =============================================
          BACKGROUND VIDEO
      ============================================= */}

      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={HERO_POSTER}
        aria-hidden="true"
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
          object-center
        "
      >
        <source
          src={HERO_VIDEO}
          type="video/mp4"
        />
      </video>

      {/* =============================================
          DARK OVERLAY
      ============================================= */}

      <div
        className="
          absolute
          inset-0
          bg-black/45
        "
      />

      {/* =============================================
          SUBTLE GRADIENT FOR TEXT READABILITY
      ============================================= */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-r
          from-black/55
          via-black/20
          to-transparent
        "
      />

      {/* =============================================
          HERO CONTENT
      ============================================= */}

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
            max-w-[820px]
          "
        >
          {/* Small contextual text */}

          <p
            className="
              mb-4
              text-[13px]
              font-medium
              leading-none
              tracking-[0.02em]
              text-white/80

              sm:text-[14px]
            "
          >
            The Last Dance 2026
          </p>

          {/* Main heading */}

          <h1
            className="
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
            Vote for the people who made campus unforgettable.
          </h1>

          {/* Description */}

          <p
            className="
              mt-5
              max-w-[620px]
              text-[14px]
              font-normal
              leading-[1.65]
              text-white/85

              sm:text-[15px]

              lg:text-[16px]
            "
          >
            Celebrate the personalities, friendships and moments that defined
            campus life. Vote for your favourites and help crown the official
            Last Dance award winners.
          </p>

          {/* =========================================
              HERO ACTIONS
          ========================================== */}

          <div
            className="
              mt-7
              flex
              flex-wrap
              items-center
              gap-3
            "
          >
            <a
              href="#leaderboard"
              className="
                inline-flex
                items-center
                justify-center
                rounded-full
                bg-white
                px-6
                py-3
                text-[14px]
                font-medium
                text-black
                transition-all
                duration-200

                hover:bg-[#ff914d]
                hover:text-white

                active:scale-[0.98]
              "
            >
              View leaderboard
            </a>

            <Link
              href="/last-dance/register"
              className="
                inline-flex
                items-center
                justify-center
                rounded-full
                border
                border-white/50
                bg-white/10
                px-6
                py-3
                text-[14px]
                font-medium
                text-white
                backdrop-blur-sm
                transition-all
                duration-200

                hover:border-white
                hover:bg-white
                hover:text-black

                active:scale-[0.98]
              "
            >
              Nominate a candidate
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LastDanceHero;