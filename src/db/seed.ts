import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { issues, submissions, users } from "./schema";

const client = postgres(process.env.DATABASE_URL as string, { max: 1 });
const db = drizzle(client, { casing: "snake_case" });

const languages = [
  "javascript",
  "typescript",
  "python",
  "java",
  "go",
  "rust",
  "ruby",
  "php",
  "c",
  "cpp",
  "csharp",
  "swift",
  "kotlin",
  "sql",
  "shell",
] as const;

const codeSnippets: Record<string, string[]> = {
  javascript: [
    `var x = 1;
var y = 2;
function add(a, b) {
  return a + b
}
console.log(add(x, y))`,
    `const fetchData = async () => {
  const res = await fetch("/api/data")
  const data = await res.json()
  return data
}
fetchData().then(d => console.log(d))`,
    `document.getElementById("btn").addEventListener("click", function() {
  var items = document.querySelectorAll(".item")
  for (var i = 0; i < items.length; i++) {
    items[i].style.display = "none"
  }
})`,
    `let arr = [1, 2, 3, 4, 5]
let result = []
for (let i = 0; i < arr.length; i++) {
  if (arr[i] % 2 == 0) {
    result.push(arr[i] * 2)
  }
}`,
    `function debounce(fn, delay) {
  let timer
  return function() {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, arguments), delay)
  }
}`,
  ],
  typescript: [
    `interface User {
  id: number
  name: string
  email: string
}

function getUser(id: number): User | undefined {
  const users: User[] = []
  return users.find(u => u.id === id)
}`,
    `type ApiResponse<T> = {
  data: T
  error: string | null
  status: number
}

async function fetchApi<T>(url: string): Promise<ApiResponse<T>> {
  const res = await fetch(url)
  const data = await res.json()
  return { data, error: null, status: res.status }
}`,
    `enum Status {
  Active = "active",
  Inactive = "inactive",
  Pending = "pending"
}

class UserService {
  private users: Map<string, any> = new Map()

  getByStatus(status: Status) {
    return [...this.users.values()].filter(u => u.status === status)
  }
}`,
  ],
  python: [
    `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(fibonacci(i))`,
    `import requests

def get_weather(city):
    url = f"https://api.weather.com/{city}"
    response = requests.get(url)
    data = response.json()
    return data["temperature"]`,
    `class LinkedList:
    def __init__(self):
        self.head = None

    def append(self, val):
        if not self.head:
            self.head = {"val": val, "next": None}
            return
        current = self.head
        while current["next"]:
            current = current["next"]
        current["next"] = {"val": val, "next": None}`,
  ],
  java: [
    `public class Calculator {
    public static int add(int a, int b) {
        return a + b;
    }

    public static void main(String[] args) {
        System.out.println(add(2, 3));
    }
}`,
    `import java.util.ArrayList;
import java.util.List;

public class TodoList {
    private List<String> items = new ArrayList<>();

    public void add(String item) {
        items.add(item);
    }

    public void remove(int index) {
        if (index >= 0 && index < items.size()) {
            items.remove(index);
        }
    }
}`,
  ],
  go: [
    `package main

import "fmt"

func main() {
    ch := make(chan int)
    go func() {
        for i := 0; i < 10; i++ {
            ch <- i
        }
        close(ch)
    }()
    for v := range ch {
        fmt.Println(v)
    }
}`,
    `package main

import (
    "errors"
    "fmt"
)

func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

func main() {
    result, err := divide(10, 3)
    if err != nil {
        fmt.Println(err)
        return
    }
    fmt.Println(result)
}`,
  ],
  rust: [
    `fn main() {
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);

    let doubled: Vec<i32> = numbers.iter().map(|x| x * 2).collect();
    println!("{:?}", doubled);
}`,
  ],
  ruby: [
    `class Animal
  attr_reader :name, :sound

  def initialize(name, sound)
    @name = name
    @sound = sound
  end

  def speak
    puts "#{@name} says #{@sound}!"
  end
end

dog = Animal.new("Dog", "Woof")
dog.speak`,
  ],
  php: [
    `<?php
function connectDB() {
    $host = "localhost";
    $user = "root";
    $pass = "";
    $db = "myapp";
    $conn = new mysqli($host, $user, $pass, $db);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    return $conn;
}
?>`,
  ],
  c: [
    `#include <stdio.h>
#include <stdlib.h>

int* create_array(int size) {
    int* arr = malloc(size * sizeof(int));
    for (int i = 0; i < size; i++) {
        arr[i] = i * i;
    }
    return arr;
}

int main() {
    int* arr = create_array(10);
    for (int i = 0; i < 10; i++) {
        printf("%d ", arr[i]);
    }
    free(arr);
    return 0;
}`,
  ],
  cpp: [
    `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> v = {5, 3, 1, 4, 2};
    std::sort(v.begin(), v.end());
    for (const auto& x : v) {
        std::cout << x << " ";
    }
    std::cout << std::endl;
    return 0;
}`,
  ],
  csharp: [
    `using System;
using System.Linq;

class Program {
    static void Main() {
        var numbers = Enumerable.Range(1, 100);
        var evens = numbers.Where(n => n % 2 == 0).Take(10);
        foreach (var n in evens) {
            Console.WriteLine(n);
        }
    }
}`,
  ],
  swift: [
    `struct User {
    let name: String
    let age: Int

    func greet() -> String {
        return "Hi, I'm \\(name) and I'm \\(age) years old."
    }
}

let user = User(name: "Alice", age: 30)
print(user.greet())`,
  ],
  kotlin: [
    `data class Product(val name: String, val price: Double)

fun main() {
    val products = listOf(
        Product("Laptop", 999.99),
        Product("Phone", 699.99),
        Product("Tablet", 449.99)
    )
    val expensive = products.filter { it.price > 500 }
    expensive.forEach { println("\${it.name}: $\${it.price}") }
}`,
  ],
  sql: [
    `SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.name
HAVING COUNT(o.id) > 5
ORDER BY order_count DESC;`,
  ],
  shell: [
    `#!/bin/bash
for file in *.log; do
  if [ -f "$file" ]; then
    lines=$(wc -l < "$file")
    echo "$file: $lines lines"
    if [ "$lines" -gt 1000 ]; then
      gzip "$file"
    fi
  fi
done`,
  ],
};

const roasts = [
  "This code looks like it was written during a power outage... with a typewriter.",
  "I've seen better error handling in a toaster.",
  "Did you write this with your eyes closed? Because it shows.",
  "This code has more bugs than a rainforest.",
  "Even ChatGPT would refuse to take credit for this.",
  "My grandma's knitting pattern has better structure than this.",
  "This is the coding equivalent of putting ketchup on a steak.",
  "I'd say go back to basics, but I'm not sure you ever learned them.",
  "If spaghetti code had a mascot, this would be it.",
  "This code doesn't just have tech debt - it has a tech mortgage.",
  "Congrats! You've written the world's most complicated way to do something simple.",
  "I've seen cleaner code in a CAPTCHA.",
  "This is what happens when you copy from Stack Overflow without reading the comments.",
  "Your variable names are so bad even your IDE gave up on autocomplete.",
  "This code is proof that just because it works doesn't mean it's right.",
  "If code reviews were a horror movie, this would be the final boss.",
  "Not gonna lie, this is giving me existential dread.",
  "The only design pattern here is chaos.",
  "I'm speechless. And not in a good way.",
  "This is so clean I almost can't roast it. Almost.",
  "Actually decent. Who helped you?",
  "Wait, this actually works? I'm genuinely surprised.",
  "Solid code. I'd hire you. Maybe. On a trial basis.",
  "This is cleaner than most production code I've seen. Respect.",
  "Okay, I'll admit it. This is pretty good.",
  "This code is tighter than my deadline.",
  "You actually used proper error handling? I'm shook.",
  "Not bad at all. Your future self will thank you.",
  "Readable, concise, and functional. Are you sure you wrote this?",
  "I tried to find something wrong but honestly... it's solid.",
];

const issueTitles = {
  critical: [
    "Using var instead of const/let",
    "No error handling whatsoever",
    "SQL injection vulnerability",
    "Memory leak detected",
    "Infinite loop risk",
    "Hardcoded credentials",
    "Missing input validation",
    "Race condition detected",
    "Unhandled promise rejection",
    "Buffer overflow potential",
  ],
  warning: [
    "Magic numbers without constants",
    "Deeply nested conditionals",
    "Function too long (50+ lines)",
    "No type annotations",
    "Unused variables detected",
    "Console.log left in production code",
    "Inconsistent naming convention",
    "Missing null checks",
    "Redundant code block",
    "Inefficient loop pattern",
  ],
  good: [
    "Clean function decomposition",
    "Good use of destructuring",
    "Proper error boundaries",
    "Well-named variables",
    "Consistent code style",
    "Efficient algorithm choice",
    "Good use of type system",
    "Solid test coverage approach",
    "Clean separation of concerns",
    "Proper resource cleanup",
  ],
};

const issueDescriptions = {
  critical: [
    "This is a serious problem that could cause data loss or security vulnerabilities in production.",
    "This pattern is known to cause crashes and unexpected behavior. Fix immediately.",
    "This vulnerability could be exploited by malicious users. Priority fix needed.",
    "This will cause your application to consume more and more memory over time until it crashes.",
    "Under certain conditions this code will never terminate, freezing your application.",
  ],
  warning: [
    "While not critical, this makes the code harder to maintain and understand.",
    "Consider refactoring this to improve readability and reduce cognitive complexity.",
    "This pattern works but there's a much cleaner way to achieve the same result.",
    "Future maintainers will struggle with this. Add documentation or simplify.",
    "This could become a problem as the codebase grows. Worth addressing now.",
  ],
  good: [
    "This is exactly how it should be done. Clean and maintainable.",
    "Great pattern choice here. Shows solid understanding of the language.",
    "Well thought out approach. This will scale nicely.",
    "Textbook implementation. Other developers should learn from this.",
    "Excellent attention to detail. This prevents common bugs.",
  ],
};

function getVerdictForScore(score: number) {
  if (score < 2) return "needs_serious_help";
  if (score < 4) return "rough_around_edges";
  if (score < 5.5) return "getting_there";
  if (score < 7) return "decent_code";
  if (score < 8.5) return "solid_work";
  return "impressive";
}

function generateIssuesForScore(score: number) {
  const issueCount = faker.number.int({ min: 2, max: 6 });
  const result: {
    severity: "critical" | "warning" | "good";
    title: string;
    description: string;
    order: number;
  }[] = [];

  for (let i = 0; i < issueCount; i++) {
    let severity: "critical" | "warning" | "good";

    if (score < 3) {
      severity = faker.helpers.weightedArrayElement([
        { value: "critical" as const, weight: 5 },
        { value: "warning" as const, weight: 3 },
        { value: "good" as const, weight: 1 },
      ]);
    } else if (score < 6) {
      severity = faker.helpers.weightedArrayElement([
        { value: "critical" as const, weight: 2 },
        { value: "warning" as const, weight: 5 },
        { value: "good" as const, weight: 2 },
      ]);
    } else {
      severity = faker.helpers.weightedArrayElement([
        { value: "critical" as const, weight: 1 },
        { value: "warning" as const, weight: 2 },
        { value: "good" as const, weight: 5 },
      ]);
    }

    result.push({
      severity,
      title: faker.helpers.arrayElement(issueTitles[severity]),
      description: faker.helpers.arrayElement(issueDescriptions[severity]),
      order: i + 1,
    });
  }

  return result;
}

function pickRoast(score: number): string {
  if (score < 4) {
    return faker.helpers.arrayElement(roasts.slice(0, 19));
  }
  if (score < 7) {
    return faker.helpers.arrayElement(roasts.slice(10, 25));
  }
  return faker.helpers.arrayElement(roasts.slice(19));
}

const USER_COUNT = 10;
const SUBMISSION_COUNT = 100;

async function seed() {
  console.log(`Seeding database with ${USER_COUNT} users...`);

  const createdUsers: { id: string }[] = [];

  for (let i = 0; i < USER_COUNT; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet
      .username({ firstName, lastName })
      .toLowerCase();

    const [user] = await db
      .insert(users)
      .values({
        name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }),
        image: faker.image.avatarGitHub(),
        username,
      })
      .returning({ id: users.id });

    createdUsers.push(user);
  }

  console.log(`  ...created ${createdUsers.length} users`);
  console.log(`Seeding database with ${SUBMISSION_COUNT} submissions...`);

  for (let i = 0; i < SUBMISSION_COUNT; i++) {
    const language = faker.helpers.arrayElement(languages);
    const snippets = codeSnippets[language] ?? codeSnippets.javascript;
    const code = faker.helpers.arrayElement(snippets);
    const lineCount = code.split("\n").length;
    const score = Number.parseFloat(
      faker.number.float({ min: 0.5, max: 9.8, fractionDigits: 1 }).toFixed(1),
    );
    const verdict = getVerdictForScore(score);
    const roast = pickRoast(score);
    const createdAt = faker.date.between({
      from: "2025-01-01",
      to: new Date(),
    });
    const user = faker.helpers.arrayElement(createdUsers);

    const [submission] = await db
      .insert(submissions)
      .values({
        userId: user.id,
        code,
        language,
        lineCount,
        roastMode: faker.datatype.boolean({ probability: 0.85 }),
        anonymous: faker.datatype.boolean({ probability: 0.3 }),
        score,
        verdict,
        roast,
        suggestedCode: faker.datatype.boolean({ probability: 0.7 })
          ? code.replace("var ", "const ")
          : null,
        createdAt,
      })
      .returning({ id: submissions.id });

    const issueList = generateIssuesForScore(score);

    if (issueList.length > 0) {
      await db.insert(issues).values(
        issueList.map((issue) => ({
          submissionId: submission.id,
          ...issue,
        })),
      );
    }

    if ((i + 1) % 25 === 0) {
      console.log(`  ...inserted ${i + 1}/${SUBMISSION_COUNT} submissions`);
    }
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
