import { motion } from "framer-motion";

export function CaptionBlock() {
  return (
    <motion.section
      id="collection"
      className="caption-block"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-18% 0px" }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      <p className="caption-kicker">Collection 01</p>
      <h1>A study in repetition.</h1>
    </motion.section>
  );
}
