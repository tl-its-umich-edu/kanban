Kanban is configured to run in the ROOT of a tomcat instance
-or- to be port forwarded to the root of a virtual host.

Installation Instructions:

$ rm -Rf $tomcat/webapps/ROOT
$ cp target/kanban.war $tomcat/webapps/ROOT.war

Configuration:

The issues shown in the kanban come from predefined JIRA queries.  See the URLs for the queries in:

  src/main/resources/jira.properties-template

If issues don't appear in the kanban, it's probably because they don't match the criteria of the queries.  Besides the value of issues' "resolution" field, it's easy to forget that the value of projects' "category" field must be one of a few specific values.  See the queries in JIRA for details.
