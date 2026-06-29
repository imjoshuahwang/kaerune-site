import Image from "next/image";
import { motion } from "framer-motion";

export function SecondaryMedia() {
  return (
    <motion.section
      className="secondary-media"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20% 0px" }}
      transition={{ duration: 1.3, ease: "easeOut" }}
    >
      <div className="secondary-frame">
        <Image
          src="/media/hero-poster.png"
          alt=""
          fill
          priority={false}
          sizes="(max-width: 700px) 92vw, 68vw"
        />
      </div>
      <p>Uniform laughter. Broadcast from above.</p>
    </motion.section>
  );
}
