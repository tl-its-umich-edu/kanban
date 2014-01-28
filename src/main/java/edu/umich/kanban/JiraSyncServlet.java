package edu.umich.kanban;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ResourceBundle;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import java.util.logging.Logger;


/**
 * Servlet implementation class JiraSyncServlet
 */
public class JiraSyncServlet extends HttpServlet {
   private static final long serialVersionUID = 1L;
   private static Log M_log = LogFactory.getLog(JiraSyncServlet.class);
   
   
   public JiraSyncServlet() {
   }
   
   /**
    * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
    */
   protected void doGet(HttpServletRequest request, HttpServletResponse response) throws  ServletException, IOException {
      response.setContentType("text/html");
      PrintWriter out =response.getWriter();
      String queryString = request.getQueryString();
      ResourceBundle props = ResourceBundle.getBundle("jira");
      
      XmlMerge xmlMerge = new XmlMerge();
      
      if (queryString.equals("OK")) {
         String mergeFiles="";
         try {
            String xmlPath = props.getString("xml.path");
            String xsltPath = props.getString("xslt.path");
            mergeFiles=xmlMerge.mergeFiles(queryString, 
                                           getServletContext().getRealPath(xsltPath),
                                           getServletContext().getRealPath(xmlPath));
         } catch (Exception e) {
            e.printStackTrace();
         }
         dataOutput(out, mergeFiles);
      }
      if(queryString.equals("wip")) {
         StringBuilder jsonWip=new StringBuilder("[ {");
         jsonWip.append("\"todo\" : \"")
            .append(props.getString("wip.todo"))
            .append("\"");
         jsonWip.append(", \"inprogress\" : \"");
         jsonWip.append(props.getString("wip.inprogress")).append("\"");
         jsonWip.append(", \"review\" : \"");
         jsonWip.append(props.getString("wip.review")).append("\"");
         jsonWip.append("} ]");
         dataOutput(out, jsonWip.toString());
      }
   }
   
   private void dataOutput(PrintWriter out, String mergeFiles) {
      out.println(mergeFiles);
      M_log.debug("merged json: "+mergeFiles);
      out.close();
   }
   
   /**
    * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
    */
   protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
      // TODO Auto-generated method stub
   }
   
}
