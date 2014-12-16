# node-cookiejar-storefile
  
## Objective



## Usage

## Netscape's cookie.txt file
http://www.cookiecentral.com/faq/#3.5

The layout of Netscape's cookies.txt file is such that each line contains one name-value pair. An example cookies.txt file may have an entry that looks like this:

.netscape.com     TRUE   /  FALSE  946684799   NETSCAPE_ID  100103

Each line represents a single piece of stored information. A tab is inserted between each of the fields.

From left-to-right, here is what each field represents:

domain - The domain that created AND that can read the variable.
flag - A TRUE/FALSE value indicating if all machines within a given domain can access the variable. This value is set automatically by the browser, depending on the value you set for domain.
path - The path within the domain that the variable is valid for.
secure - A TRUE/FALSE value indicating if a secure connection with the domain is needed to access the variable.
expiration - The UNIX time that the variable will expire on. UNIX time is defined as the number of seconds since Jan 1, 1970 00:00:00 GMT.
name - The name of the variable.
value - The value of the variable. 



## Developing



### Tools

