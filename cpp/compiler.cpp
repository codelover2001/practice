#include <bits/stdc++.h>
#include <string.h>
using namespace std;
vector<string> tokens;
vector<string> keywords;
bool is_end(char ch)
{
    if (ch == ' ' || ch == '+' || ch == '-' || ch == '*' ||
        ch == '/' || ch == ',' || ch == ';' || ch == '>' ||
        ch == '<' || ch == '=' || ch == '(' || ch == ')' ||
        ch == '[' || ch == ']' || ch == '{' || ch == '}')
        return (true);
    return (false);
}
bool is_operator(char ch)
{
    if (ch == '+' || ch == '-' || ch == '*' ||
        ch == '/' || ch == '>' || ch == '<' ||
        ch == '=')
        return (true);
    return (false);
}
bool is_identifier(string str)
{
    if (str[0] == '0' || str[0] == '1' || str[0] == '2' ||
        str[0] == '3' || str[0] == '4' || str[0] == '5' ||
        str[0] == '6' || str[0] == '7' || str[0] == '8' ||
        str[0] == '9' || is_end(str[0]) == true)
        return (false);
    return (true);
}
bool is_keyword(string str)
{
    if ((str=="पूर्णांक")||(str == "if") || (str == "else") ||
        (str == "while") || (str == "do") ||
        (str == "break") ||
        (str == "continue") || (str == "int") || (str == "double") || (str == "float")
         || (str == "return") || (str == "char") || (str == "case") || (str == "char") 
         || (str == "sizeof") || (str == "long") || (str == "short")
          || (str == "typedef") || (str == "switch") || (str == "unsigned") 
          || (str == "void") || (str == "static") 
          || (str == "struct") || (str == "goto"))
        return (true);
    return (false);
}
bool is_integer(string str)
{
    int i, len = str.length();

    if (len == 0)
        return (false);
    for (i = 0; i < len; i++)
    {
        if (str[i] != '0' && str[i] != '1' && str[i] != '2' && str[i] != '3'
         && str[i] != '4' && str[i] != '5' && str[i] != '6' && str[i] != '7'
          && str[i] != '8' && str[i] != '9' || (str[i] == '-' && i > 0))
            return (false);
    }
    return (true);
}
void parse_for_lexical_analysis(string a)
{
    int n = a.size();

    int l = 0, r = 0;
    while (r < n && l <= r)
    {
        string s;
        if (!is_end(a[r]))
            r++;
        else
        {
            if (l == r)
            {
                if (is_operator(a[l]))
                {
                    cout << a[l] << " is an operator" << endl;
                }
                else if (a[l] != ' ')
                {
                    cout << "Error : " << a[l] << " is not identified" << endl;
                    return;
                }
                r++;
                l = r;
            }
            else if (l < r)
            {
                s = a.substr(l, r - l);
                // cout << l << " " << r << endl;
                if (is_keyword(s))
                    cout << s << " is a keyword" << endl;
                else if (is_integer(s))
                    cout << s << " is an integer" << endl;
                else if (is_identifier(s))
                    cout << s << " is an identifier" << endl;
                else
                {
                    cout << "Error : " << s << " is not identified" << endl;
                    return;
                }
                r++;
                l = r;
            }
        }
    }
}
int main()
{
    //"int a = b + 1c; "
    // string a = "int a = b + c;";
    string a = "पूर्णांक a = b + c;";
    parse_for_lexical_analysis(a);
    return 0;
}
