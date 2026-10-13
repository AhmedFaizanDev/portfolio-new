"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    return (
        <AnimatePresence mode="sync">
            <motion.div
                key={pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ ease: "easeOut", duration: 0.12 }}
                className="w-full flex-1 flex flex-col"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
