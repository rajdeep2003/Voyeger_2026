import React from "react";
import {
  FaExternalLinkAlt,
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaPhoneAlt,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      titleKey: "footer.aboutUs.title",
      links: [
        { key: "footer.aboutUs.ourStory", href: "#" },
        { key: "footer.aboutUs.team", href: "#" },
        { key: "footer.aboutUs.careers", href: "#" },
        { key: "footer.aboutUs.press", href: "#" },
      ],
    },
    {
      titleKey: "footer.support.title",
      links: [
        { key: "footer.support.faqs", href: "#" },
        { key: "footer.support.contact", href: "#" },
        { key: "footer.support.privacyPolicy", href: "#" },
        { key: "footer.support.terms", href: "#" },
      ],
    },
    {
      titleKey: "footer.resources.title",
      links: [
        { key: "footer.resources.blog", href: "#" },
        { key: "footer.resources.guides", href: "#" },
        { key: "footer.resources.webinars", href: "#" },
        { key: "footer.resources.helpCenter", href: "#" },
      ],
    },
  ];

  const socialLinks = [
    { label: "Facebook", href: "#", icon: FaFacebookF },
    { label: "Twitter", href: "#", icon: FaTwitter },
    { label: "Instagram", href: "#", icon: FaInstagram },
    { label: "LinkedIn", href: "#", icon: FaLinkedinIn },
    { label: "YouTube", href: "#", icon: FaYoutube },
  ];

  return (
    <footer className="relative isolate overflow-hidden bg-[#0d1118] text-slate-100">
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ zIndex: -1 }}
        aria-hidden="true"
      >
        <svg
          width="1535"
          height="197"
          viewBox="0 0 535 47"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-w-[3840px] min-w-[280px] opacity-[0.14]"
        >
          <path d="M27.904 45.824L-1.96695e-06 1.024H22.208L39.36 31.36L57.152 1.024H79.36L51.392 45.824H27.904ZM114.729 46.848C106.623 46.848 99.5828 45.9307 93.6095 44.096C87.6788 42.2187 83.0922 39.552 79.8495 36.096C76.6495 32.64 75.0495 28.544 75.0495 23.808V23.04C75.0495 18.2613 76.6495 14.1653 79.8495 10.752C83.0922 7.296 87.6788 4.65067 93.6095 2.816C99.5828 0.93867 106.623 3.8147e-06 114.729 3.8147e-06C122.879 3.8147e-06 129.919 0.93867 135.85 2.816C141.78 4.65067 146.345 7.296 149.546 10.752C152.788 14.1653 154.41 18.2613 154.41 23.04V23.808C154.41 28.544 152.788 32.64 149.546 36.096C146.345 39.552 141.78 42.2187 135.85 44.096C129.919 45.9307 122.879 46.848 114.729 46.848ZM114.729 32.128C120.575 32.128 125.183 31.4027 128.554 29.952C131.967 28.4587 133.674 26.4107 133.674 23.808V23.04C133.674 20.4373 131.967 18.4107 128.554 16.96C125.183 15.4667 120.575 14.72 114.729 14.72C108.927 14.72 104.319 15.4667 100.905 16.96C97.4922 18.4107 95.7855 20.4373 95.7855 23.04V23.808C95.7855 26.4107 97.4922 28.4587 100.905 29.952C104.319 31.4027 108.927 32.128 114.729 32.128ZM176.139 45.824V29.696L146.379 1.024H171.147L186.06 15.808L200.972 1.024H225.74L195.979 29.696V45.824H176.139ZM208.501 45.824L236.469 1.024H259.958L287.862 45.824H266.549L262.709 38.848H233.845L229.813 45.824H208.501ZM242.357 24L240.181 27.84H256.63L254.518 24L249.206 13.12H247.925L242.357 24ZM318.621 46.848C313.587 46.848 308.936 46.3147 304.669 45.248C300.403 44.1813 296.691 42.6453 293.533 40.64C290.376 38.6347 287.923 36.224 286.173 33.408C284.424 30.5493 283.549 27.3493 283.549 23.808V23.04C283.549 18.304 285.171 14.208 288.413 10.752C291.656 7.296 296.243 4.65067 302.173 2.816C308.147 0.93867 315.144 3.8147e-06 323.166 3.8147e-06C332.851 3.8147e-06 341.043 1.216 347.742 3.648C354.44 6.03734 359.475 9.408 362.846 13.76L342.942 19.648C341.235 17.856 338.739 16.4907 335.453 15.552C332.211 14.5707 328.115 14.08 323.166 14.08C316.936 14.08 312.029 14.8907 308.445 16.512C304.861 18.0907 303.069 20.2667 303.069 23.04V23.808C303.069 26.5813 304.861 28.7787 308.445 30.4C312.029 31.9787 316.936 32.768 323.166 32.768C325.64 32.768 328.2 32.64 330.846 32.384C333.491 32.0853 335.987 31.68 338.333 31.168C340.68 30.6133 342.622 29.952 344.158 29.184H322.973V21.504H362.846V45.824H347.486L348.126 36.224H346.91C345.459 38.4427 343.347 40.3413 340.574 41.92C337.8 43.4987 334.536 44.7147 330.782 45.568C327.07 46.4213 323.016 46.848 318.621 46.848ZM369.097 45.824V1.024H448.458V13.952H388.938V17.92H441.546V28.928H388.938V32.896H448.458V45.824H369.097ZM454.66 45.824V1.024H518.468C523.033 1.024 526.532 2.048 528.964 4.096C531.396 6.10134 532.612 8.87467 532.612 12.416C532.612 15.1467 531.78 17.3653 530.116 19.072C528.452 20.7787 525.849 21.952 522.308 22.592V23.872C526.191 24.2133 529.113 25.3227 531.076 27.2C533.039 29.0347 534.02 31.424 534.02 34.368V45.824H513.284V35.008C513.284 34.24 513.049 33.6213 512.58 33.152C512.111 32.6827 511.471 32.448 510.66 32.448H474.5V45.824H454.66ZM474.5 20.288H509.38C510.191 20.288 510.831 20.032 511.3 19.52C511.769 19.008 512.004 18.3253 512.004 17.472C512.004 16.5333 511.748 15.8293 511.236 15.36C510.724 14.8907 510.105 14.656 509.38 14.656H474.5V20.288Z" fill="white" />
        </svg>
      </div>

      <div className="px-6 mx-auto max-w-7xl py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-5">
          <div className="xl:col-span-2">
            <motion.h2
              className="text-3xl font-semibold tracking-tight text-white"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
            >
              {t("footer.brandName")}
            </motion.h2>
            <p className="max-w-md mt-3 text-base text-slate-300">{t("footer.tagline")}</p>

            <div className="flex flex-col items-start gap-3 mt-6">
              <a
                href="tel:+0000000000"
                className="flex items-center gap-3 transition-colors group text-slate-200 hover:text-white"
              >
                <FaPhoneAlt className="text-white" />
                <span className="relative inline-block">
                  {t("footer.phone")}
                  <span className="absolute bottom-0 left-0 w-full h-px transition-transform duration-300 origin-left scale-x-0 bg-white group-hover:scale-x-100" />
                </span>
              </a>
              <a
                href="mailto:hello@voyager.com"
                className="flex items-center gap-3 transition-colors group text-slate-200 hover:text-white"
              >
                <FaEnvelope className="text-white" />
                <span className="relative inline-block">
                  {t("footer.email")}
                  <span className="absolute bottom-0 left-0 w-full h-px transition-transform duration-300 origin-left scale-x-0 bg-white group-hover:scale-x-100" />
                </span>
              </a>
              <div className="flex items-center gap-3 text-slate-200">
                <FaMapMarkerAlt className="text-white" />
                <span>{t("footer.address")}</span>
              </div>
            </div>
          </div>

          {footerLinks.map((section, sectionIndex) => (
            <div key={section.titleKey} className="space-y-4">
              <motion.h3
                className="text-lg font-semibold text-white"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: sectionIndex * 0.08 }}
              >
                {t(section.titleKey)}
              </motion.h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.key}>
                    <a
                      href={link.href}
                      className="inline-flex items-center gap-2 transition-colors group text-slate-300 hover:text-white"
                    >
                      <span className="relative inline-flex items-center gap-2">
                        <span>{t(link.key)}</span>
                        <FaExternalLinkAlt className="text-xs text-white transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-white transition-transform duration-300 group-hover:scale-x-100" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm md:p-6">
          <div className="grid items-center grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <h4 className="text-lg font-semibold text-white">{t("footer.newsletter.title")}</h4>
              <p className="mt-1 text-sm text-slate-300">{t("footer.newsletter.description")}</p>
            </div>
            <div className="relative">
              <input
                type="email"
                placeholder={t("footer.newsletter.placeholder")}
                className="h-11 w-full rounded-full border border-white/15 bg-[#111827] px-4 pr-12 text-sm text-white placeholder:text-slate-400 focus:border-white focus:outline-none"
              />
              <button
                className="absolute right-1.5 top-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0b1220] transition hover:brightness-110"
                aria-label={t("footer.newsletter.subscribeButton")}
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#111827] text-slate-200 transition-all hover:-translate-y-0.5 hover:border-white hover:text-white"
              >
                <Icon className="text-sm" />
              </a>
            ))}
          </div>
        </div>

        <div className="pt-6 mt-10 border-t border-white/10">
          <div className="flex flex-col items-start justify-between gap-3 text-sm text-slate-400 md:flex-row md:items-center">
            <p>{t("footer.copyright", { year: currentYear })}</p>
            <div className="flex flex-wrap items-center gap-5">
              <a href="#" className="relative transition group text-slate-300 hover:text-white">
                {t("footer.privacyPolicyLink")}
                <span className="absolute bottom-0 left-0 w-full h-px transition-transform duration-300 origin-left scale-x-0 bg-white group-hover:scale-x-100" />
              </a>
              <a href="#" className="relative transition group text-slate-300 hover:text-white">
                {t("footer.termsOfServiceLink")}
                <span className="absolute bottom-0 left-0 w-full h-px transition-transform duration-300 origin-left scale-x-0 bg-white group-hover:scale-x-100" />
              </a>
              <a href="#" className="relative transition group text-slate-300 hover:text-white">
                {t("footer.cookiesLink")}
                <span className="absolute bottom-0 left-0 w-full h-px transition-transform duration-300 origin-left scale-x-0 bg-white group-hover:scale-x-100" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
