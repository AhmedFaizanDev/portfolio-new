import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faGithub, faInstagram, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { socials } from "../data/profile";

const icons = { email: faEnvelope, linkedin: faLinkedinIn, github: faGithub, instagram: faInstagram };

export default function SocialLinks({ className = "", iconClassName = "w-[18px] h-[18px]" }: { className?: string; iconClassName?: string }) {
  return (
    <div className={className}>
      {socials.map((s) => (
        <a
          key={s.name}
          href={s.href}
          aria-label={s.name}
          {...(s.icon === "email" ? {} : { target: "_blank", rel: "noreferrer" })}
          className="text-[var(--site-muted)] transition-all hover:text-[var(--site-accent)] hover:-translate-y-1"
        >
          <FontAwesomeIcon icon={icons[s.icon]} className={iconClassName} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}
