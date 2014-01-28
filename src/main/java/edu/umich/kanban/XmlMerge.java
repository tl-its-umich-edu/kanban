package edu.umich.kanban;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.Writer;
import java.net.URL;
import java.net.URLConnection;
import java.util.ResourceBundle;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Source;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;

import org.apache.commons.codec.binary.Base64;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

public class XmlMerge {

   /**
    ** Merge and transform the two JIRA XML file streams defined by the its.url and sakai.url properties
    ** @param queryString Servlet query string (currently not used)
    ** @param xsltPath Input filepath of XSLT to transform xml into JSON
    ** @param xmlPath Output filepath of merged XML
    ** @returns String XML file transformed into JSON
    **/
   public String mergeFiles(String queryString, String xsltPath, String xmlPath) throws Exception {
      
      ResourceBundle labels = ResourceBundle.getBundle("jira");
      String its=basicAuthITS(labels);
      String sakai = basicAuthSakai(labels);
      
      //merging 2 Xml file from both ITS and Sakai Xml to single file using DOm parsing
      DocumentBuilderFactory domFactory = DocumentBuilderFactory
         .newInstance();
      domFactory.setIgnoringComments(true);
      DocumentBuilder builder = domFactory.newDocumentBuilder();
      Document doc = builder.parse(new InputSource(new StringReader(sakai)));
      Document docIts = builder.parse(new InputSource(new StringReader(its)));
      
      NodeList nodesSakai = doc.getElementsByTagName("item");
      NodeList nodesIts = docIts.getElementsByTagName("item");
      for (int i = 0; i < nodesIts.getLength(); i++) {
         Node n = (Node) doc.importNode(nodesIts.item(i), true);
         nodesSakai.item(0).getParentNode().appendChild(n);
      }
      Transformer transformer = TransformerFactory.newInstance()
         .newTransformer();
      transformer.setOutputProperty(OutputKeys.INDENT, "yes");
      StreamResult result = new StreamResult(new StringWriter());
      DOMSource xmlSource = new DOMSource(doc);
      transformer.transform(xmlSource, result);
      
      Writer output = output = new BufferedWriter(new FileWriter(xmlPath));
      String xmlOutput = result.getWriter().toString();
      output.write(xmlOutput);
      output.close();
      
      // XSLT code - transform merged XMLfile into JSON
      TransformerFactory factory = TransformerFactory.newInstance();
      Source xsltSource = new StreamSource(new File(xsltPath));
      Transformer newTransformer = factory.newTransformer(xsltSource);
      StreamResult result1 = new StreamResult(new StringWriter());
      
      newTransformer.transform(xmlSource, result1);
      String jsonOutput = result1.getWriter().toString();
      return jsonOutput;
   }
   
   //getting ITS data using basic Auth
   private String basicAuthITS(ResourceBundle its) throws Exception {
      
      String webPage =its.getString("its.url");
      String name =its.getString("its.username");
      String password = its.getString("its.password");
      String authString=name+":"+password;
      byte[] authEncBytes = Base64.encodeBase64(authString.getBytes());
      String authStringEnc = new String(authEncBytes);
      URL url = new URL(webPage);
      URLConnection urlConnection = url.openConnection();
      urlConnection.setRequestProperty("Authorization", "Basic " + authStringEnc);
      InputStream is = urlConnection.getInputStream();
      InputStreamReader isr = new InputStreamReader(is);
      int numCharsRead;
      char[] charArray = new char[1024];
      StringBuffer sb = new StringBuffer();
      while ((numCharsRead = isr.read(charArray)) > 0) {
         sb.append(charArray, 0, numCharsRead);
      }
      String result = sb.toString();
      return result;
   }
   
   //getting the Sakai data 
   private String basicAuthSakai(ResourceBundle sakai) throws Exception {
      
      String webPage = sakai.getString("sakai.url");
      URL url = new URL(webPage);
      URLConnection urlConnection = url.openConnection();
      InputStream is = urlConnection.getInputStream();
      InputStreamReader isr = new InputStreamReader(is);
      int numCharsRead;
      char[] charArray = new char[1024];
      StringBuffer sb = new StringBuffer();
      while ((numCharsRead = isr.read(charArray)) > 0) {
         sb.append(charArray, 0, numCharsRead);
      }
      String result = sb.toString();
      return result;
      
   }
   
}
