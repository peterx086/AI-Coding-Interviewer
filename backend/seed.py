from typing import Dict, List

BASE_PROBLEMS = [
    {
        "title": "Two Sum",
        "difficulty": "Easy",
        "topics": ["Arrays", "Hash Map"],
        "description": "Given an array of integers and a target value, return the indices of two numbers that add up to the target.",
        "input_description": "A list of numbers and a target integer.",
        "output_description": "Two indices that point to the numbers that sum to the target.",
        "constraints": "Assume exactly one valid answer exists.",
        "examples": [
            {"input": "[2,7,11,15], target = 9", "output": "0,1"}
        ],
        "visible_tests": [
            {"input": "2 7 11 15\n9\n", "expected": "0,1"},
            {"input": "3 2 4\n6\n", "expected": "1,2"}
        ],
        "hidden_tests": [{"input": "1 2 3 4 5\n7\n", "expected": "1,4"}],
    },
    {
        "title": "Valid Parentheses",
        "difficulty": "Easy",
        "topics": ["Stack", "String"],
        "description": "Check whether the provided bracket string is valid.",
        "input_description": "A string containing parentheses or brackets.",
        "output_description": "True if the string is valid, otherwise False.",
        "constraints": "Empty input is valid.",
        "examples": [
            {"input": "()", "output": "True"},
            {"input": "()[]{}", "output": "True"}
        ],
        "visible_tests": [
            {"input": "()\n", "expected": "True"},
            {"input": "()[]{}\n", "expected": "True"}
        ],
        "hidden_tests": [{"input": "(]\n", "expected": "False"}],
    },
    {
        "title": "Merge Sorted Lists",
        "difficulty": "Medium",
        "topics": ["Linked List", "Two Pointers"],
        "description": "Merge two sorted sequences and return the combined sorted order.",
        "input_description": "Two sorted sequences represented by space-separated values on separate lines.",
        "output_description": "Merged space-separated values in sorted order.",
        "constraints": "Each input line may contain duplicate values.",
        "examples": [
            {"input": "1 2 4\n1 3 4\n", "output": "1 1 2 3 4 4"}
        ],
        "visible_tests": [
            {"input": "1 2 4\n1 3 4\n", "expected": "1 1 2 3 4 4"}
        ],
        "hidden_tests": [{"input": "2 5 7\n1 3 4\n", "expected": "1 2 3 4 5 7"}],
    },
    {
        "title": "Longest Substring Without Repeating Characters",
        "difficulty": "Medium",
        "topics": ["Strings", "Sliding Window"],
        "description": "Given a string, find the length of the longest substring without repeating characters.",
        "input_description": "A single string.",
        "output_description": "An integer representing the maximum length.",
        "constraints": "The input length can be up to 10^4 characters.",
        "examples": [
            {"input": "abcabcbb\n", "output": "3"},
            {"input": "bbbbb\n", "output": "1"}
        ],
        "visible_tests": [
            {"input": "pwwkew\n", "expected": "3"}
        ],
        "hidden_tests": [{"input": "abba\n", "expected": "2"}],
    },
    {
        "title": "Container With Most Water",
        "difficulty": "Medium",
        "topics": ["Two Pointers", "Array"],
        "description": "Given heights, find two lines that together with the x-axis form a container holding the most water.",
        "input_description": "A list of positive integers separated by spaces.",
        "output_description": "The maximum area as an integer.",
        "constraints": "There are at least two heights.",
        "examples": [
            {"input": "1 8 6 2 5 4 8 3 7\n", "output": "49"}
        ],
        "visible_tests": [
            {"input": "1 1\n", "expected": "1"}
        ],
        "hidden_tests": [{"input": "4 3 2 1 4\n", "expected": "16"}],
    },
    {
        "title": "Product of Array Except Self",
        "difficulty": "Medium",
        "topics": ["Array", "Prefix Sum"],
        "description": "Return an array where each element is the product of all other elements except itself.",
        "input_description": "A list of integers separated by spaces.",
        "output_description": "A space-separated list of products.",
        "constraints": "Do not use division.",
        "examples": [
            {"input": "1 2 3 4\n", "output": "24 12 8 6"}
        ],
        "visible_tests": [
            {"input": "-1 1 0 -3 3\n", "expected": "0 0 9 0 0"}
        ],
        "hidden_tests": [{"input": "2 3 4\n", "expected": "12 8 6"}],
    },
    {
        "title": "Climbing Stairs",
        "difficulty": "Easy",
        "topics": ["Dynamic Programming"],
        "description": "Count how many distinct ways to climb to the top of n steps if you can take 1 or 2 steps at a time.",
        "input_description": "A single integer n.",
        "output_description": "The number of distinct ways.",
        "constraints": "1 <= n <= 45.",
        "examples": [
            {"input": "2\n", "output": "2"},
            {"input": "3\n", "output": "3"}
        ],
        "visible_tests": [
            {"input": "4\n", "expected": "5"}
        ],
        "hidden_tests": [{"input": "1\n", "expected": "1"}],
    },
    {
        "title": "Best Time to Buy and Sell Stock",
        "difficulty": "Easy",
        "topics": ["Array", "Greedy"],
        "description": "Given stock prices, return the maximum profit from a single buy and sell.",
        "input_description": "A list of stock prices separated by spaces.",
        "output_description": "Maximum possible profit.",
        "constraints": "Buy before you sell.",
        "examples": [
            {"input": "7 1 5 3 6 4\n", "output": "5"}
        ],
        "visible_tests": [
            {"input": "7 6 4 3 1\n", "expected": "0"}
        ],
        "hidden_tests": [{"input": "1 2\n", "expected": "1"}],
    },
    {
        "title": "Minimum Window Substring",
        "difficulty": "Hard",
        "topics": ["Strings", "Sliding Window"],
        "description": "Find the minimum-length substring that contains all characters of a target string.",
        "input_description": "Two lines: source string and target string.",
        "output_description": "The shortest substring or an empty string if none exists.",
        "constraints": "Source and target are non-empty.",
        "examples": [
            {"input": "ADOBECODEBANC\nABC\n", "output": "BANC"}
        ],
        "visible_tests": [
            {"input": "a\naa\n", "expected": ""}
        ],
        "hidden_tests": [{"input": "ABAACBAB\nABC\n", "expected": "ACB"}],
    },
    {
        "title": "Binary Search",
        "difficulty": "Easy",
        "topics": ["Binary Search"],
        "description": "Search a sorted list for a target value and return its index." ,
        "input_description": "A sorted list of integers and a target value.",
        "output_description": "The index of the target or -1 if not found.",
        "constraints": "Use an O(log n) algorithm.",
        "examples": [
            {"input": "-1 0 3 5 9 12\n9\n", "output": "4"}
        ],
        "visible_tests": [
            {"input": "1 2 3 4 5\n6\n", "expected": "-1"}
        ],
        "hidden_tests": [{"input": "2 4 6 8\n6\n", "expected": "2"}],
    },
    {
        "title": "Maximum Subarray",
        "difficulty": "Easy",
        "topics": ["Array", "Dynamic Programming"],
        "description": "Find the contiguous subarray with the largest sum.",
        "input_description": "A list of integers separated by spaces.",
        "output_description": "The maximum sum of any contiguous subarray.",
        "constraints": "At least one number is present.",
        "examples": [
            {"input": "-2 1 -3 4 -1 2 1 -5 4\n", "output": "6"}
        ],
        "visible_tests": [
            {"input": "1\n", "expected": "1"}
        ],
        "hidden_tests": [{"input": "-1 -2 -3\n", "expected": "-1"}],
    },
    {
        "title": "Longest Palindromic Substring",
        "difficulty": "Medium",
        "topics": ["Strings", "Dynamic Programming"],
        "description": "Return the longest palindromic substring found in the input string.",
        "input_description": "A single string.",
        "output_description": "The longest palindromic substring.",
        "constraints": "Multiple answers may be valid; return any one.",
        "examples": [
            {"input": "babad\n", "output": "bab"}
        ],
        "visible_tests": [
            {"input": "cbbd\n", "expected": "bb"}
        ],
        "hidden_tests": [{"input": "a\n", "expected": "a"}],
    },
    {
        "title": "Number of Islands",
        "difficulty": "Medium",
        "topics": ["DFS", "Graph"],
        "description": "Count islands in a grid where 1 represents land and 0 represents water.",
        "input_description": "A grid of 0s and 1s separated by spaces and newlines.",
        "output_description": "The number of islands.",
        "constraints": "Grid dimensions are at most 50x50.",
        "examples": [
            {"input": "1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1\n", "output": "3"}
        ],
        "visible_tests": [
            {"input": "1 0\n0 1\n", "expected": "2"}
        ],
        "hidden_tests": [{"input": "1 1\n1 1\n", "expected": "1"}],
    },
    {
        "title": "House Robber",
        "difficulty": "Medium",
        "topics": ["Dynamic Programming", "Array"],
        "description": "Given non-negative integers representing money in houses, return the maximum amount that can be robbed without robbing adjacent houses.",
        "input_description": "A list of non-negative integers separated by spaces.",
        "output_description": "Maximum rob amount.",
        "constraints": "You cannot rob adjacent houses.",
        "examples": [
            {"input": "1 2 3 1\n", "output": "4"}
        ],
        "visible_tests": [
            {"input": "2 7 9 3 1\n", "expected": "12"}
        ],
        "hidden_tests": [{"input": "2 1 1 2\n", "expected": "4"}],
    },
    {
        "title": "Course Schedule",
        "difficulty": "Medium",
        "topics": ["Graph", "DFS"],
        "description": "Determine whether you can finish all courses given prerequisite pairs.",
        "input_description": "First line is the number of courses, followed by prerequisite pairs.",
        "output_description": "True if no cycle exists, otherwise False.",
        "constraints": "Input is valid and non-empty.",
        "examples": [
            {"input": "2\n1 0\n", "output": "True"}
        ],
        "visible_tests": [
            {"input": "2\n1 0\n0 1\n", "expected": "False"}
        ],
        "hidden_tests": [{"input": "3\n1 0\n2 1\n", "expected": "True"}],
    },
    {
        "title": "Top K Frequent Elements",
        "difficulty": "Medium",
        "topics": ["Hash Map", "Heap"],
        "description": "Return the k most frequent elements from the input list.",
        "input_description": "A list of integers followed by k on a new line.",
        "output_description": "The most frequent elements separated by spaces.",
        "constraints": "k is positive and no larger than the number of unique elements.",
        "examples": [
            {"input": "1 1 1 2 2 3\n2\n", "output": "1 2"}
        ],
        "visible_tests": [
            {"input": "1 2 2 3 3 3\n2\n", "expected": "3 2"}
        ],
        "hidden_tests": [{"input": "1 2 2\n1\n", "expected": "2"}],
    },
    {
        "title": "Word Ladder Length",
        "difficulty": "Hard",
        "topics": ["BFS", "Graph"],
        "description": "Find the length of the shortest transformation sequence from beginWord to endWord.",
        "input_description": "Three lines: beginWord, endWord, and a space-separated word list.",
        "output_description": "The number of steps in the shortest transformation sequence.",
        "constraints": "Each transformation changes exactly one letter.",
        "examples": [
            {"input": "hit\ncog\nhot dot dog lot log\n", "output": "5"}
        ],
        "visible_tests": [
            {"input": "hit\ncog\nhot dot dog lot log\n", "expected": "5"}
        ],
        "hidden_tests": [{"input": "hit\nhot\nhot dot\n", "expected": "2"}],
    },
    {
        "title": "Linked List Cycle",
        "difficulty": "Easy",
        "topics": ["Linked List", "Two Pointers"],
        "description": "Detect whether a linked list contains a cycle.",
        "input_description": "A list of node values followed by a cycle position.",
        "output_description": "True if there is a cycle, otherwise False.",
        "constraints": "The position is -1 if no cycle exists.",
        "examples": [
            {"input": "3 2 0 -4\n1\n", "output": "True"}
        ],
        "visible_tests": [
            {"input": "1 2 3 4\n-1\n", "expected": "False"}
        ],
        "hidden_tests": [{"input": "1 2\n0\n", "expected": "True"}],
    },
    {
        "title": "Valid Anagram",
        "difficulty": "Easy",
        "topics": ["Hash Map", "String"],
        "description": "Determine whether two strings are anagrams of each other.",
        "input_description": "Two lines: s and t.",
        "output_description": "True if t is an anagram of s.",
        "constraints": "Strings contain lowercase letters.",
        "examples": [
            {"input": "anagram\nnagaram\n", "output": "True"}
        ],
        "visible_tests": [
            {"input": "rat\ncar\n", "expected": "False"}
        ],
        "hidden_tests": [{"input": "aabbcc\nabcabc\n", "expected": "True"}],
    },
    {
        "title": "Unique Paths",
        "difficulty": "Medium",
        "topics": ["Dynamic Programming"],
        "description": "Count unique paths from the top-left to the bottom-right of a grid moving only down or right.",
        "input_description": "Two integers m and n separated by a space.",
        "output_description": "Number of unique paths.",
        "constraints": "1 <= m,n <= 15.",
        "examples": [
            {"input": "3 2\n", "output": "3"}
        ],
        "visible_tests": [
            {"input": "7 3\n", "expected": "28"}
        ],
        "hidden_tests": [{"input": "1 1\n", "expected": "1"}],
    },
]


def build_problem_catalog() -> List[Dict[str, object]]:
    problems: List[Dict[str, object]] = []

    template_count = len(BASE_PROBLEMS)
    for variant_id in range(1, 11):
        for index, template in enumerate(BASE_PROBLEMS):
            problem_id = (variant_id - 1) * template_count + index + 1
            problems.append(
                {
                    "id": problem_id,
                    "title": f"{template['title']} {variant_id}",
                    "difficulty": template["difficulty"],
                    "topics": template["topics"],
                    "estimated_time": 10 + index * 2,
                    "description": template["description"],
                    "input_description": template["input_description"],
                    "output_description": template["output_description"],
                    "constraints": template["constraints"],
                    "examples": template["examples"],
                    "hints": [
                        "Start by understanding the input format and constraints.",
                        "Consider whether a simple brute-force solution is enough, or if the problem needs an optimized approach.",
                        "Check edge cases such as empty input or maximum input sizes."
                    ],
                    "starter_code": (
                        "def solve():\n"
                        "    # Write your solution here\n"
                        "    pass\n\n"
                        "if __name__ == '__main__':\n"
                        "    import sys\n"
                        "    data = sys.stdin.read().strip()\n"
                        "    print(data)\n"
                    ),
                    "visible_tests": template["visible_tests"],
                    "hidden_tests": template["hidden_tests"],
                }
            )
    return problems
