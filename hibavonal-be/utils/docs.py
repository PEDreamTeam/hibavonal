import os

_DOCS_DIR = os.path.normpath(
    os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs')
)


def doc_path(*parts):
    """Return absolute path to a docs YAML file."""
    return os.path.join(_DOCS_DIR, *parts)