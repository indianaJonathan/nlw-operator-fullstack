function Footer() {
  return (
    <footer className="border-t border-border-primary px-4 py-6 md:px-10">
      <p className="text-center font-mono text-2xs text-text-tertiary">
        {"// want to improve this project? "}
        <a
          href="https://github.com/indianaJonathan/nlw-operator-fullstack"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-secondary transition-colors hover:text-text-primary"
        >
          open a PR
        </a>
      </p>
    </footer>
  );
}

export { Footer };
