import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from words import normalize_windows

class WordWindows(unittest.TestCase):
    def test_duplicate_and_reversed_starts(self):
        words = [dict(w='In', line=0, s=3.8, e=3.8), dict(w='nineteen', line=0, s=3.78, e=4.47)]
        normalize_windows(words, [dict(i=0, start=3.681, end=6.843)])
        self.assertLess(words[0]['s'], words[0]['e'])
        self.assertLessEqual(words[0]['e'], words[1]['s'])
        self.assertEqual(words[1]['s'], 3.78)

    def test_collapsed_at_cut_boundary(self):
        words = [dict(w='with', line=0, s=19.606, e=19.606), dict(w='air', line=0, s=19.606, e=19.78)]
        normalize_windows(words, [dict(i=0, start=19.606, end=22.049)])
        for w in words:
            self.assertGreater(w['e'], w['s'])
            self.assertGreaterEqual(w['s'], 19.606)
            self.assertLessEqual(w['e'], 22.049)
        self.assertLessEqual(words[0]['e'], words[1]['s'])

    def test_preserves_valid_measurements(self):
        words = [dict(w='pet', line=0, s=1.1, e=1.3), dict(w='rock', line=0, s=1.4, e=1.8)]
        expected = [dict(w) for w in words]
        normalize_windows(words, [dict(i=0, start=1, end=2)])
        self.assertEqual(words, expected)

if __name__ == '__main__': unittest.main()
