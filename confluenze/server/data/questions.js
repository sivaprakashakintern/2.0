// CONFLUENZE - 20 Elite Debugging Challenges
// Designed for maximum difficulty. No "Easy/Hard" labels.
// Options are highly technical and designed to evade simple guessing.

const questions = [
  {
    id: 1,
    language: 'Java',
    code: `public class Main {
    public static void main(String[] args) {
        String s1 = "JAVA";
        String s2 = "JA" + "VA";
        String s3 = "JA";
        String s4 = s3 + "VA";
        System.out.println((s1 == s2) + " " + (s1 == s4));
    }
}`,
    question: 'Determine the output of this reference comparison sequence.',
    options: [
      'true true',
      'true false',
      'false true',
      'false false'
    ],
    answer: 1
  },
  {
    id: 2,
    language: 'C',
    code: `#include <stdio.h>
int main() {
    int x = 1, y = 1;
    if (x == y || ++x > 1) {
        printf("%d %d", x, y);
    }
    return 0;
}`,
    question: 'Analyze the short-circuiting behavior of this logical OR operation.',
    options: [
      '1 1',
      '2 1',
      '1 2',
      '2 2'
    ],
    answer: 0
  },
  {
    id: 3,
    language: 'C++',
    code: `#include <iostream>
int main() {
    int i = 5;
    int &ref = i;
    int j = 10;
    ref = j;
    j = 15;
    std::cout << i << " " << ref;
    return 0;
}`,
    question: 'Predict the final values of the original variable and its reference.',
    options: [
      '5 10',
      '10 10',
      '10 15',
      '15 15'
    ],
    answer: 1
  },
  {
    id: 4,
    language: 'Java',
    code: `class A {
    A() { System.out.print("A"); }
}
class B extends A {
    B() { this(10); System.out.print("B"); }
    B(int x) { System.out.print("C"); }
}
public class Main {
    public static void main(String[] args) {
        new B();
    }
}`,
    question: 'Trace the constructor invocation chain to determine the output.',
    options: [
      'ACB',
      'ABC',
      'CAB',
      'BC'
    ],
    answer: 0
  },
  {
    id: 5,
    language: 'C',
    code: `#include <stdio.h>
int main() {
    char a = 255;
    if (a == 255) printf("Equal");
    else printf("Not Equal");
    return 0;
}`,
    question: 'Evaluate the comparison after promotion of a signed char (assuming 8-bit char).',
    options: [
      'Equal',
      'Not Equal',
      'Runtime Error',
      'Compilation Error'
    ],
    answer: 1
  },
  {
    id: 6,
    language: 'C++',
    code: `#include <iostream>
struct X {
    X() { std::cout << "1"; }
    X(const X&) { std::cout << "2"; }
};
X func(X obj) { return obj; }
int main() {
    X x1;
    func(x1);
    return 0;
}`,
    question: 'How many copy operations are initiated by this function call (excluding elision)?',
    options: [
      '12',
      '121',
      '122',
      '1'
    ],
    answer: 2
  },
  {
    id: 7,
    language: 'Java',
    code: `public class Main {
    public static void main(String[] args) {
        int x = 0;
        for (int i = 0; i < 100; i++) {
            x = x++;
        }
        System.out.println(x);
    }
}`,
    question: 'Predict the state of "x" after 100 iterations of the post-increment assignment.',
    options: [
      '100',
      '0',
      '99',
      '1'
    ],
    answer: 1
  },
  {
    id: 8,
    language: 'C',
    code: `#include <stdio.h>
int main() {
    int i = 5;
    printf("%d %d %d", i++, i++, i++);
    return 0;
}`,
    question: 'Determine the output (assuming behavior defined by specific common compiler order).',
    options: [
      '5 6 7',
      '7 6 5',
      '5 5 5',
      'Undefined Behavior'
    ],
    answer: 3
  },
  {
    id: 9,
    language: 'C++',
    code: `#include <iostream>
int main() {
    int a = 1;
    int b = 2;
    int c = 3;
    int res = (a++, ++b, c++);
    std::cout << res;
    return 0;
}`,
    question: 'Analyze the comma operator evaluation and determine the assigned result.',
    options: [
      '1',
      '3',
      '4',
      '6'
    ],
    answer: 1
  },
  {
    id: 10,
    language: 'Java',
    code: `public class Main {
    public static void main(String[] args) {
        try {
            int x = 0;
            System.out.println(1 / x);
        } catch (Exception e) {
            System.out.print("E");
        } finally {
            System.out.print("F");
        }
    }
}`,
    question: 'Predict the catch-finally execution sequence.',
    options: [
      'E',
      'F',
      'EF',
      'FE'
    ],
    answer: 2
  },
  {
    id: 11,
    language: 'C',
    code: `#include <stdio.h>
int main() {
    int a[3][2] = {{1,2}, {3,4}, {5,6}};
    printf("%d", **(a + 1));
    return 0;
}`,
    question: 'Determine the value accessed through double dereferencing of the pointer to array.',
    options: [
      '1',
      '2',
      '3',
      '4'
    ],
    answer: 2
  },
  {
    id: 12,
    language: 'C++',
    code: `#include <iostream>
class A {
public:
    virtual void f() { std::cout << "A"; }
};
class B : public A {
private:
    void f() { std::cout << "B"; }
};
int main() {
    A* p = new B();
    p->f();
    return 0;
}`,
    question: 'What occurs when a private override is accessed via a public base class pointer?',
    options: [
      'Compilation Error (f is private)',
      'A is printed',
      'B is printed',
      'Runtime Access Violation'
    ],
    answer: 2
  },
  {
    id: 13,
    language: 'Java',
    code: `public class Main {
    public static void main(String[] args) {
        double d = 10.0 / 0.0;
        System.out.println(d);
    }
}`,
    question: 'Predict the behavior of floating-point division by zero in Java.',
    options: [
      'ArithmeticException',
      '0.0',
      'Infinity',
      'NaN'
    ],
    answer: 2
  },
  {
    id: 14,
    language: 'C',
    code: `#include <stdio.h>
int main() {
    int x = 10;
    static int y = x;
    printf("%d", y);
    return 0;
}`,
    question: 'Why does this code fail to compile in most C compilers?',
    options: [
      'static variables cannot be named y',
      'static variables must be initialized with constant expressions',
      'x must be declared as static as well',
      'Initialization of y must happen in a separate line'
    ],
    answer: 1
  },
  {
    id: 15,
    language: 'C++',
    code: `#include <iostream>
struct S {
    int x;
    S() : x(1) {}
    S(int v) : x(v) {}
};
int main() {
    S s();
    // std::cout << s.x; (would fail)
    return 0;
}`,
    question: 'Why is "S s();" considered the "Most Vexing Parse" in C++?',
    options: [
      'It creates an object named s',
      'It is treated as a function declaration returning S',
      'It is a syntax error',
      'It calls the constructor with 0'
    ],
    answer: 1
  },
  {
    id: 16,
    language: 'Java',
    code: `public class Main {
    public static void main(String[] args) {
        int x = 10;
        x = ~x;
        System.out.println(x);
    }
}`,
    question: 'Calculate the result of the bitwise NOT operation on 10.',
    options: [
      '-10',
      '-11',
      '9',
      '0'
    ],
    answer: 1
  },
  {
    id: 17,
    language: 'C',
    code: `#include <stdio.h>
int main() {
    int i = 5;
    int j = i++;
    int k = ++i;
    printf("%d %d %d", i, j, k);
    return 0;
}`,
    question: 'Determine the final state of i, j, and k.',
    options: [
      '7 5 7',
      '6 5 7',
      '7 6 7',
      '6 6 6'
    ],
    answer: 0
  },
  {
    id: 18,
    language: 'C++',
    code: `#include <iostream>
int main() {
    int arr[] = {1, 2, 3};
    int* p = arr + 1;
    std::cout << p[-1];
    return 0;
}`,
    question: 'Is it valid to use a negative index on a pointer in C++?',
    options: [
      'No, runtime error',
      'Yes, it accesses the element at (p - 1), which is 1',
      'No, compilation error',
      'Yes, it prints a random address'
    ],
    answer: 1
  },
  {
    id: 19,
    language: 'Java',
    code: `public class Main {
    public static void main(String[] args) {
        String s = "HELLO";
        s.toLowerCase();
        System.out.println(s);
    }
}`,
    question: 'Predict the output based on String immutability.',
    options: [
      'hello',
      'HELLO',
      'Runtime Error',
      'H'
    ],
    answer: 1
  },
  {
    id: 20,
    language: 'C',
    code: `#include <stdio.h>
int main() {
    printf("%d", sizeof('A'));
    return 0;
}`,
    question: 'What is the size of a character literal in C compared to a char variable?',
    options: [
      '1',
      'Same as sizeof(int), usually 4',
      'Depends on the character',
      '2'
    ],
    answer: 1
  }
];

module.exports = questions;
