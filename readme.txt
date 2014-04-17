Kanban is configured to run in the ROOT of a tomcat instance
-or- to be port forwarded to the root of a virtual host.

Installation Instructions:

$ rm -Rf $tomcat/webapps/ROOT
$ cp target/kanban.war $tomcat/webapps/ROOT.war
